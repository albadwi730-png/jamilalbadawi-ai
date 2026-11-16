import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { generateImage, listImageModels } from "./_core/imageGeneration";
import { transcribeAudio } from "./_core/voiceTranscription";
import { storageGetSignedUrl, storagePut } from "./storage";
import { cleanAudio } from "./audioProcessing";
import { systemRouter } from "./_core/systemRouter";
import { adminProcedure, protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { addCredits, createPaymentRequest, deductCredits, getDashboardSummary, getOrCreateWallet, listPaymentRequests, recordCompletedGeneration, refundCredits, reviewPaymentRequest } from "./db";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  wallet: router({
    me: protectedProcedure.query(async ({ ctx }) => {
      const wallet = await getOrCreateWallet(ctx.user.id);
      return { ...wallet, balance: wallet.freeCredits + wallet.purchasedCredits - wallet.usedCredits };
    }),
    createPaymentRequest: protectedProcedure
      .input(z.object({ planId: z.number().int().positive().optional(), method: z.string().min(2).max(80), amountYer: z.number().int().positive(), receiptUrl: z.string().url().optional(), reference: z.string().max(160).optional() }))
      .mutation(async ({ ctx, input }) => createPaymentRequest({ ...input, userId: ctx.user.id })),
    uploadReceipt: protectedProcedure
      .input(z.object({ fileName: z.string().min(1).max(180), mimeType: z.string().min(3).max(120), base64: z.string().min(100).max(20_000_000) }))
      .mutation(async ({ ctx, input }) => {
        const bytes = Buffer.from(input.base64, "base64");
        if (bytes.length > 15 * 1024 * 1024) throw new Error("حجم الإيصال يتجاوز 15MB");
        const stored = await storagePut(`payment-receipts/${ctx.user.id}/${Date.now()}-${input.fileName}`, bytes, input.mimeType);
        const signedUrl = await storageGetSignedUrl(stored.key);
        return { url: signedUrl, key: stored.key };
      }),
  }),
  admin: router({
    overview: adminProcedure.query(() => getDashboardSummary()),
    payments: adminProcedure.query(() => listPaymentRequests()),
    grantCredits: adminProcedure
      .input(z.object({ userId: z.number().int().positive(), amount: z.number().int().positive(), reason: z.string().min(3).max(255) }))
      .mutation(({ ctx, input }) => addCredits(input.userId, input.amount, "grant", input.reason, `admin-grant-${ctx.user.id}-${Date.now()}`)),
    deductCredits: adminProcedure
      .input(z.object({ userId: z.number().int().positive(), amount: z.number().int().positive(), reason: z.string().min(3).max(255), idempotencyKey: z.string().min(8).max(120) }))
      .mutation(({ input }) => deductCredits(input.userId, input.amount, input.reason, input.idempotencyKey)),
    refundCredits: adminProcedure
      .input(z.object({ userId: z.number().int().positive(), amount: z.number().int().positive(), reason: z.string().min(3).max(255), idempotencyKey: z.string().min(8).max(120) }))
      .mutation(({ input }) => refundCredits(input.userId, input.amount, input.reason, input.idempotencyKey)),
    reviewPayment: adminProcedure
      .input(z.object({ paymentId: z.number().int().positive(), decision: z.enum(["approved", "rejected"]), reason: z.string().max(500).optional() }))
      .mutation(({ ctx, input }) => reviewPaymentRequest({ ...input, reviewerId: ctx.user.id })),
  }),
  ai: router({
    imageModels: protectedProcedure.query(async () => listImageModels()),
    generateImage: protectedProcedure
      .input(z.object({ prompt: z.string().min(4).max(4000), model: z.string().optional(), quality: z.string().optional() }))
      .mutation(async ({ ctx, input }) => {
        const result = await generateImage(input);
        if (result.url) await recordCompletedGeneration({ userId: ctx.user.id, tool: "images", resultUrl: result.url, assetName: "صورة مولدة", assetKind: "image", mimeType: "image/png" });
        return { ...result, status: "completed" as const };
      }),
    transcribe: protectedProcedure
      .input(z.object({ audioUrl: z.string().url(), language: z.string().optional(), prompt: z.string().optional() }))
      .mutation(async ({ input }) => {
        const result = await transcribeAudio(input);
        if ("error" in result) throw new Error(result.error);
        return result;
      }),
    transcribeUpload: protectedProcedure
      .input(z.object({
        fileName: z.string().min(1).max(180),
        mimeType: z.string().min(3).max(120),
        base64: z.string().min(100).max(140_000_000),
        language: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const bytes = Buffer.from(input.base64, "base64");
        if (bytes.length > 100 * 1024 * 1024) throw new Error("حجم الملف يتجاوز 100MB");
        const stored = await storagePut(`uploads/${ctx.user.id}/${Date.now()}-${input.fileName}`, bytes, input.mimeType);
        const signedUrl = await storageGetSignedUrl(stored.key);
        const result = await transcribeAudio({ audioUrl: signedUrl, language: input.language });
        if ("error" in result) throw new Error(result.error);
        await recordCompletedGeneration({ userId: ctx.user.id, tool: "transcribe", resultUrl: stored.url, assetName: input.fileName, assetKind: "audio", mimeType: input.mimeType, sizeBytes: bytes.length });
        return { ...result, assetUrl: stored.url, status: "completed" as const };
      }),
    cleanAudioUpload: protectedProcedure
      .input(z.object({ fileName: z.string().min(1).max(180), mimeType: z.string().min(3).max(120), base64: z.string().min(100).max(140_000_000) }))
      .mutation(async ({ ctx, input }) => {
        const source = Buffer.from(input.base64, "base64");
        if (source.length > 100 * 1024 * 1024) throw new Error("حجم الملف يتجاوز 100MB");
        const cleaned = await cleanAudio(source, input.fileName);
        const stored = await storagePut(`processed/${ctx.user.id}/${Date.now()}-cleaned.wav`, cleaned.data, cleaned.contentType);
        await recordCompletedGeneration({ userId: ctx.user.id, tool: "clean", resultUrl: stored.url, assetName: `${input.fileName}-cleaned.wav`, assetKind: "audio", mimeType: cleaned.contentType, sizeBytes: cleaned.data.length });
        return { url: stored.url, status: "completed" as const, format: cleaned.extension };
      }),
  }),
});

export type AppRouter = typeof appRouter;
