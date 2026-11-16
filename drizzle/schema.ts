import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export const plans = mysqlTable("plans", {
  id: int("id").autoincrement().primaryKey(),
  slug: varchar("slug", { length: 80 }).notNull().unique(),
  name: varchar("name", { length: 120 }).notNull(),
  priceYer: int("priceYer").notNull().default(0),
  credits: int("credits").notNull().default(0),
  interval: mysqlEnum("interval", ["free", "monthly", "yearly", "one_time"]).notNull().default("free"),
  storageMb: int("storageMb").notNull().default(500),
  active: int("active").notNull().default(1),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const wallets = mysqlTable("wallets", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  freeCredits: int("freeCredits").notNull().default(0),
  purchasedCredits: int("purchasedCredits").notNull().default(0),
  usedCredits: int("usedCredits").notNull().default(0),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const creditTransactions = mysqlTable("creditTransactions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  walletId: int("walletId").notNull(),
  kind: mysqlEnum("kind", ["grant", "purchase", "usage", "refund", "adjustment"]).notNull(),
  amount: int("amount").notNull(),
  balanceAfter: int("balanceAfter").notNull(),
  reason: varchar("reason", { length: 255 }).notNull(),
  idempotencyKey: varchar("idempotencyKey", { length: 120 }).notNull().unique(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const projects = mysqlTable("projects", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 180 }).notNull(),
  type: varchar("type", { length: 40 }).notNull(),
  status: mysqlEnum("status", ["draft", "processing", "completed", "failed"]).notNull().default("draft"),
  thumbnailUrl: text("thumbnailUrl"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const assets = mysqlTable("assets", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  projectId: int("projectId"),
  kind: varchar("kind", { length: 40 }).notNull(),
  name: varchar("name", { length: 180 }).notNull(),
  storageKey: varchar("storageKey", { length: 255 }).notNull().unique(),
  storageUrl: text("storageUrl").notNull(),
  mimeType: varchar("mimeType", { length: 120 }),
  sizeBytes: int("sizeBytes").default(0),
  deletedAt: timestamp("deletedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const generationJobs = mysqlTable("generationJobs", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  projectId: int("projectId"),
  tool: varchar("tool", { length: 60 }).notNull(),
  status: mysqlEnum("status", ["queued", "processing", "completed", "failed", "cancelled"]).notNull().default("queued"),
  costCredits: int("costCredits").notNull().default(0),
  progress: int("progress").notNull().default(0),
  resultUrl: text("resultUrl"),
  errorMessage: text("errorMessage"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  completedAt: timestamp("completedAt"),
});

export const paymentRequests = mysqlTable("paymentRequests", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  planId: int("planId"),
  method: varchar("method", { length: 80 }).notNull(),
  amountYer: int("amountYer").notNull(),
  receiptUrl: text("receiptUrl"),
  reference: varchar("reference", { length: 160 }),
  status: mysqlEnum("status", ["awaiting_transfer", "pending_review", "approved", "rejected", "cancelled"]).notNull().default("pending_review"),
  rejectionReason: text("rejectionReason"),
  reviewedBy: int("reviewedBy"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  reviewedAt: timestamp("reviewedAt"),
});

export const subscriptions = mysqlTable("subscriptions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  planId: int("planId").notNull(),
  status: mysqlEnum("status", ["active", "paused", "expired", "cancelled"]).notNull().default("active"),
  startsAt: timestamp("startsAt").notNull(),
  endsAt: timestamp("endsAt").notNull(),
  renewAt: timestamp("renewAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const plansRelations = undefined;
export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Wallet = typeof wallets.$inferSelect;
export type Project = typeof projects.$inferSelect;
export type PaymentRequest = typeof paymentRequests.$inferSelect;
