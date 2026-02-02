import { z } from 'zod';

export const CategoriesValidation = {
  list: z.object({
    query: z
      .object({
        isActive: z.union([z.literal('true'), z.literal('false')]).optional(),
      })
      .optional(),
    params: z.object({}).optional(),
    body: z.object({}).optional(),
  }),

  create: z.object({
    body: z.object({
      name: z.string().min(1),
      description: z.string().optional(),
    }),
    params: z.object({}).optional(),
    query: z.object({}).optional(),
  }),

  update: z.object({
    params: z.object({ id: z.string().uuid() }),
    body: z
      .object({
        name: z.string().min(1).optional(),
        description: z.string().min(1).optional(),
        isActive: z.boolean().optional(),
      })
      .refine((v) => Object.keys(v).length > 0, { message: 'At least one field is required' }),
    query: z.object({}).optional(),
  }),

  remove: z.object({
    params: z.object({ id: z.string().uuid() }),
    body: z.object({}).optional(),
    query: z.object({}).optional(),
  }),
};

export type CategoriesListSchema = z.infer<typeof CategoriesValidation.list>;
export type CategoriesCreateSchema = z.infer<typeof CategoriesValidation.create>;
export type CategoriesUpdateSchema = z.infer<typeof CategoriesValidation.update>;
export type CategoriesRemoveSchema = z.infer<typeof CategoriesValidation.remove>;
