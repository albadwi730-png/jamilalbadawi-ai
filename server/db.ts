import { and, desc, eq, gte, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, PaymentRequest, User, Wallet, assets, creditTransactions, generationJobs, paymentRequests, plans, users, wallets } from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const values: InsertUser = { openId: user.openId };
  const updateSet: Record<string, unknown> = {};
  const textFields = ["name", "email", "loginMethod"] as const;
  for (const field of textFields) {
    if (user[field] !== undefined) {
      values[field] = user[field] ?? null;
      updateSet[field] = user[field] ?? null;
    }
  }
  if (user.lastSignedIn !== undefined) { values.lastSignedIn = user.lastSignedIn; updateSet.lastSignedIn = user.lastSignedIn; }
  if (user.role !== undefined) { values.role = user.role; updateSet.role = user.role; }
  else if (user.openId === ENV.ownerOpenId) { values.role = "admin"; updateSet.role = "admin"; }
  if (!values.lastSignedIn) values.lastSignedIn = new Date();
  if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();
  await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
}

export async function getUserByOpenId(openId: string): Promise<User | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result[0];
}

export async function recordCompletedGeneration(input: { userId: number; tool: string; costCredits?: number; resultUrl: string; assetName: string; assetKind: string; mimeType?: string; sizeBytes?: number }) {
  const db = await getDb();
  if (!db) return undefined;
  const job = await db.insert(generationJobs).values({ userId: input.userId, tool: input.tool, status: "completed", costCredits: input.costCredits ?? 0, progress: 100, resultUrl: input.resultUrl, completedAt: new Date() });
  const asset = await db.insert(assets).values({ userId: input.userId, kind: input.assetKind, name: input.assetName, storageKey: input.resultUrl, storageUrl: input.resultUrl, mimeType: input.mimeType, sizeBytes: input.sizeBytes ?? 0 });
  return { jobId: Number(job[0].insertId), assetId: Number(asset[0].insertId) };
}

export async function getOrCreateWallet(userId: number): Promise<Wallet> {
  const db = await getDb();
  if (!db) return { id: 0, userId, freeCredits: 0, purchasedCredits: 0, usedCredits: 0, updatedAt: new Date() };
  const found = await db.select().from(wallets).where(eq(wallets.userId, userId)).limit(1);
  if (found[0]) return found[0];
  await db.insert(wallets).values({ userId, freeCredits: 250, purchasedCredits: 0, usedCredits: 0 });
  const created = await db.select().from(wallets).where(eq(wallets.userId, userId)).limit(1);
  if (!created[0]) throw new Error("Wallet creation failed");
  return created[0];
}

export async function addCredits(userId: number, amount: number, kind: "grant" | "purchase" | "refund" | "adjustment", reason: string, idempotencyKey: string) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  return db.transaction(async tx => {
    const duplicate = await tx.select().from(creditTransactions).where(eq(creditTransactions.idempotencyKey, idempotencyKey)).limit(1);
    if (duplicate[0]) return duplicate[0];
    const wallet = await getOrCreateWallet(userId);
    const nextPurchased = wallet.purchasedCredits + amount;
    const nextBalance = wallet.freeCredits + nextPurchased - wallet.usedCredits;
    await tx.update(wallets).set({ purchasedCredits: nextPurchased, updatedAt: new Date() }).where(eq(wallets.id, wallet.id));
    const inserted = await tx.insert(creditTransactions).values({ userId, walletId: wallet.id, kind, amount, balanceAfter: nextBalance, reason, idempotencyKey });
    const rows = await tx.select().from(creditTransactions).where(eq(creditTransactions.id, Number(inserted[0].insertId))).limit(1);
    return rows[0];
  });
}


export async function deductCredits(userId: number, amount: number, reason: string, idempotencyKey: string) {
  if (!Number.isInteger(amount) || amount <= 0) throw new Error("Credit amount must be a positive integer");
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  return db.transaction(async tx => {
    const duplicate = await tx.select().from(creditTransactions).where(eq(creditTransactions.idempotencyKey, idempotencyKey)).limit(1);
    if (duplicate[0]) return duplicate[0];
    const walletRows = await tx.select().from(wallets).where(eq(wallets.userId, userId)).limit(1);
    const wallet = walletRows[0];
    if (!wallet) throw new Error("Wallet not found");
    const balance = wallet.freeCredits + wallet.purchasedCredits - wallet.usedCredits;
    if (balance < amount) throw new Error("الرصيد غير كافٍ");
    const updated = await tx.update(wallets).set({ usedCredits: sql`${wallets.usedCredits} + ${amount}`, updatedAt: new Date() }).where(and(eq(wallets.id, wallet.id), gte(sql`${wallets.freeCredits} + ${wallets.purchasedCredits} - ${wallets.usedCredits}`, amount)));
    if (!updated[0] || updated[0].affectedRows !== 1) throw new Error("تعذر حجز الرصيد؛ أعد المحاولة");
    const inserted = await tx.insert(creditTransactions).values({ userId, walletId: wallet.id, kind: "usage", amount: -amount, balanceAfter: balance - amount, reason, idempotencyKey });
    const rows = await tx.select().from(creditTransactions).where(eq(creditTransactions.id, Number(inserted[0].insertId))).limit(1);
    return rows[0];
  });
}

export async function refundCredits(userId: number, amount: number, reason: string, idempotencyKey: string) {
  if (!Number.isInteger(amount) || amount <= 0) throw new Error("Credit amount must be a positive integer");
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  return db.transaction(async tx => {
    const duplicate = await tx.select().from(creditTransactions).where(eq(creditTransactions.idempotencyKey, idempotencyKey)).limit(1);
    if (duplicate[0]) return duplicate[0];
    const walletRows = await tx.select().from(wallets).where(eq(wallets.userId, userId)).limit(1);
    const wallet = walletRows[0];
    if (!wallet || wallet.usedCredits < amount) throw new Error("لا يمكن إرجاع الرصيد المطلوب");
    await tx.update(wallets).set({ usedCredits: sql`${wallets.usedCredits} - ${amount}`, updatedAt: new Date() }).where(eq(wallets.id, wallet.id));
    const inserted = await tx.insert(creditTransactions).values({ userId, walletId: wallet.id, kind: "refund", amount, balanceAfter: wallet.freeCredits + wallet.purchasedCredits - wallet.usedCredits + amount, reason, idempotencyKey });
    const rows = await tx.select().from(creditTransactions).where(eq(creditTransactions.id, Number(inserted[0].insertId))).limit(1);
    return rows[0];
  });
}

export async function createPaymentRequest(input: { userId: number; planId?: number; method: string; amountYer: number; receiptUrl?: string; reference?: string }) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  if (input.receiptUrl || input.reference) {
    const value = input.receiptUrl ?? input.reference;
    const duplicate = await db.select().from(paymentRequests).where(sql`${input.receiptUrl ? paymentRequests.receiptUrl : paymentRequests.reference} = ${value}`).limit(1);
    if (duplicate[0]) throw new Error("تم تسجيل هذا الإيصال أو الرقم المرجعي من قبل");
  }
  const inserted = await db.insert(paymentRequests).values({ ...input, status: "pending_review" });
  const rows = await db.select().from(paymentRequests).where(eq(paymentRequests.id, Number(inserted[0].insertId))).limit(1);
  return rows[0];
}

export async function listPaymentRequests(): Promise<PaymentRequest[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(paymentRequests).orderBy(desc(paymentRequests.createdAt)).limit(50);
}

export async function getDashboardSummary() {
  const db = await getDb();
  if (!db) return { users: 0, activeUsers: 0, newUsers: 0, revenue: 0, creditsSold: 0, creditsUsed: 0, audioJobs: 0, videoJobs: 0, successfulJobs: 0, failedJobs: 0, pendingPayments: 0 };
  const [userCount, newUsers, paymentTotals, creditTotals, pending] = await Promise.all([
    db.select({ count: sql<number>`count(*)` }).from(users),
    db.select({ count: sql<number>`count(*)` }).from(users).where(sql`${users.createdAt} >= DATE_SUB(NOW(), INTERVAL 30 DAY)`),
    db.select({ revenue: sql<number>`coalesce(sum(${paymentRequests.amountYer}), 0)` }).from(paymentRequests).where(eq(paymentRequests.status, "approved")),
    db.select({ sold: sql<number>`coalesce(sum(case when ${creditTransactions.kind} in ('purchase','grant') then ${creditTransactions.amount} else 0 end), 0)`, used: sql<number>`coalesce(sum(case when ${creditTransactions.kind} = 'usage' then abs(${creditTransactions.amount}) else 0 end), 0)` }).from(creditTransactions),
    db.select({ count: sql<number>`count(*)` }).from(paymentRequests).where(eq(paymentRequests.status, "pending_review")),
  ]);
  return { users: Number(userCount[0]?.count ?? 0), activeUsers: 0, newUsers: Number(newUsers[0]?.count ?? 0), revenue: Number(paymentTotals[0]?.revenue ?? 0), creditsSold: Number(creditTotals[0]?.sold ?? 0), creditsUsed: Number(creditTotals[0]?.used ?? 0), audioJobs: 0, videoJobs: 0, successfulJobs: 0, failedJobs: 0, pendingPayments: Number(pending[0]?.count ?? 0) };
}

export async function reviewPaymentRequest(input: { paymentId: number; reviewerId: number; decision: "approved" | "rejected"; reason?: string }) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  return db.transaction(async tx => {
    const rows = await tx.select().from(paymentRequests).where(eq(paymentRequests.id, input.paymentId)).limit(1);
    const payment = rows[0];
    if (!payment) throw new Error("Payment request not found");
    if (payment.status !== "pending_review") return payment;
    if (input.decision === "rejected") {
      await tx.update(paymentRequests).set({ status: "rejected", rejectionReason: input.reason ?? "لم يتم اعتماد الإيصال", reviewedBy: input.reviewerId, reviewedAt: new Date() }).where(eq(paymentRequests.id, payment.id));
      const updated = await tx.select().from(paymentRequests).where(eq(paymentRequests.id, payment.id)).limit(1);
      return updated[0];
    }
    let credits = 0;
    if (payment.planId) {
      const planRows = await tx.select().from(plans).where(eq(plans.id, payment.planId)).limit(1);
      credits = planRows[0]?.credits ?? 0;
    }
    if (credits > 0) {
      const walletRows = await tx.select().from(wallets).where(eq(wallets.userId, payment.userId)).limit(1);
      let wallet = walletRows[0];
      if (!wallet) {
        await tx.insert(wallets).values({ userId: payment.userId, freeCredits: 0, purchasedCredits: 0, usedCredits: 0 });
        const created = await tx.select().from(wallets).where(eq(wallets.userId, payment.userId)).limit(1);
        wallet = created[0];
      }
      if (!wallet) throw new Error("Wallet not found");
      const nextPurchased = wallet.purchasedCredits + credits;
      const nextBalance = wallet.freeCredits + nextPurchased - wallet.usedCredits;
      await tx.update(wallets).set({ purchasedCredits: nextPurchased, updatedAt: new Date() }).where(eq(wallets.id, wallet.id));
      await tx.insert(creditTransactions).values({ userId: payment.userId, walletId: wallet.id, kind: "purchase", amount: credits, balanceAfter: nextBalance, reason: `اعتماد طلب الدفع #${payment.id}`, idempotencyKey: `payment-${payment.id}` });
    }
    await tx.update(paymentRequests).set({ status: "approved", reviewedBy: input.reviewerId, reviewedAt: new Date() }).where(eq(paymentRequests.id, payment.id));
    const updated = await tx.select().from(paymentRequests).where(eq(paymentRequests.id, payment.id)).limit(1);
    return updated[0];
  });
}
