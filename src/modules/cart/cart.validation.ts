import { z } from 'zod';

export const CartValidation = {
  addItem: z.object({
    body: z.object({
      medicineId: z.string().uuid(),
      quantity: z.number().int().min(1),
    }),
    params: z.object({}).optional(),
    query: z.object({}).optional(),
  }),

  updateItem: z.object({
    params: z.object({ medicineId: z.string().uuid() }),
    body: z.object({
      quantity: z.number().int().min(1),
    }),
    query: z.object({}).optional(),
  }),

  removeItem: z.object({
    params: z.object({ medicineId: z.string().uuid() }),
    body: z.object({}).optional(),
    query: z.object({}).optional(),
  }),
};

export type CartAddItemSchema = z.infer<typeof CartValidation.addItem>;
export type CartUpdateItemSchema = z.infer<typeof CartValidation.updateItem>;
export type CartRemoveItemSchema = z.infer<typeof CartValidation.removeItem>;


