import { z } from 'zod';

export const ReviewsValidation = {
  listForMedicine: z.object({
    params: z.object({ id: z.string().uuid() }),
    query: z
      .object({
        page: z.coerce.number().int().positive().optional(),
        limit: z.coerce.number().int().positive().max(100).optional(),
      })
      .optional(),
    body: z.object({}).optional(),
  }),

  create: z.object({
    body: z.object({
      medicineId: z.string().uuid(),
      orderId: z.string().uuid().optional(),
      rating: z.number().int().min(1).max(5),
      comment: z.string().min(1).optional(),
    }),
    params: z.object({}).optional(),
    query: z.object({}).optional(),
  }),

  listMe: z.object({
    query: z
      .object({
        page: z.coerce.number().int().positive().optional(),
        limit: z.coerce.number().int().positive().max(100).optional(),
      })
      .optional(),
    params: z.object({}).optional(),
    body: z.object({}).optional(),
  }),
};

export type ReviewsListForMedicineSchema = z.infer<typeof ReviewsValidation.listForMedicine>;
export type ReviewsCreateSchema = z.infer<typeof ReviewsValidation.create>;
export type ReviewsListMeSchema = z.infer<typeof ReviewsValidation.listMe>;


