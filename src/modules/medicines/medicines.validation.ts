import { z } from 'zod';

export const MedicinesValidation = {
  listPublic: z.object({
    query: z
      .object({
        q: z.string().min(1).optional(),
        categoryId: z.string().uuid().optional(),
        manufacturer: z.string().min(1).optional(),
        minPrice: z.coerce.number().nonnegative().optional(),
        maxPrice: z.coerce.number().nonnegative().optional(),
        inStock: z.union([z.literal('true'), z.literal('false')]).optional(),
        sellerId: z.string().uuid().optional(),
        page: z.coerce.number().int().positive().optional(),
        limit: z.coerce.number().int().positive().max(100).optional(),
        sortBy: z.enum(['price', 'createdAt', 'ratingAvg']).optional(),
        sortOrder: z.enum(['asc', 'desc']).optional(),
      })
      .optional(),
    params: z.object({}).optional(),
    body: z.object({}).optional(),
  }),

  getOne: z.object({
    params: z.object({ id: z.string().uuid() }),
    query: z.object({}).optional(),
    body: z.object({}).optional(),
  }),

  create: z.object({
    body: z.object({
      name: z.string().min(1),
      categoryId: z.string().uuid(),
      manufacturer: z.string().min(1),
      unit: z.string().min(1),
      price: z.number().nonnegative(),
      stock: z.number().int().nonnegative(),
      images: z.array(z.string().url()).default([]),
      description: z.string().min(1),
      isActive: z.boolean().optional(),
      slug: z.string().min(1).optional(),
    }),
    params: z.object({}).optional(),
    query: z.object({}).optional(),
  }),

  update: z.object({
    params: z.object({ id: z.string().uuid() }),
    body: z
      .object({
        name: z.string().min(1).optional(),
        categoryId: z.string().uuid().optional(),
        manufacturer: z.string().min(1).optional(),
        unit: z.string().min(1).optional(),
        price: z.number().nonnegative().optional(),
        stock: z.number().int().nonnegative().optional(),
        images: z.array(z.string().url()).optional(),
        description: z.string().min(1).optional(),
        isActive: z.boolean().optional(),
        slug: z.string().min(1).optional(),
      })
      .refine((v) => Object.keys(v).length > 0, { message: 'At least one field is required' }),
    query: z.object({}).optional(),
  }),

  adminUpdate: z.object({
    params: z.object({ id: z.string().uuid() }),
    body: z
      .object({
        isActive: z.boolean().optional(),
        categoryId: z.string().uuid().optional(),
        stock: z.number().int().nonnegative().optional(),
        price: z.number().nonnegative().optional(),
      })
      .refine((v) => Object.keys(v).length > 0, { message: 'At least one field is required' }),
    query: z.object({}).optional(),
  }),
};

export type MedicinesListPublicSchema = z.infer<typeof MedicinesValidation.listPublic>;
export type MedicinesGetOneSchema = z.infer<typeof MedicinesValidation.getOne>;
export type MedicinesCreateSchema = z.infer<typeof MedicinesValidation.create>;
export type MedicinesUpdateSchema = z.infer<typeof MedicinesValidation.update>;
export type MedicinesAdminUpdateSchema = z.infer<typeof MedicinesValidation.adminUpdate>;
