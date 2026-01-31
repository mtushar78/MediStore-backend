import { Prisma } from '@prisma/client';
import { z } from 'zod';

const addressSchema = z
  .object({
    addressLine1: z.string().min(1).optional(),
    city: z.string().min(1).optional(),
    area: z.string().min(1).optional(),
    notes: z.string().min(1).optional(),
  })
  .passthrough();

export const UsersValidation = {
  updateMe: z.object({
    body: z
      .object({
        name: z.string().min(1).optional(),
        phone: z.string().min(1).optional(),
        address: addressSchema.optional().transform((v) => v as Prisma.JsonObject),
      })
      .refine((v) => Object.keys(v).length > 0, { message: 'At least one field is required' }),
    params: z.object({}).optional(),
    query: z.object({}).optional(),
  }),
};

export type UpdateMeRequestSchema = z.infer<typeof UsersValidation.updateMe>;




