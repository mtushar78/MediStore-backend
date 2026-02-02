import { z } from 'zod';

export const AdminValidation = {
  listUsers: z.object({
    query: z
      .object({
        role: z.enum(['customer', 'seller', 'admin']).optional(),
        status: z.enum(['active', 'banned']).optional(),
        q: z.string().min(1).optional(),
        page: z.coerce.number().int().positive().optional(),
        limit: z.coerce.number().int().positive().max(100).optional(),
        sortBy: z.enum(['createdAt', 'name', 'email']).optional(),
        sortOrder: z.enum(['asc', 'desc']).optional(),
      })
      .optional(),
    params: z.object({}).optional(),
    body: z.object({}).optional(),
  }),

  getUser: z.object({
    params: z.object({ id: z.string().uuid() }),
    query: z.object({}).optional(),
    body: z.object({}).optional(),
  }),

  updateUserStatus: z.object({
    params: z.object({ id: z.string().uuid() }),
    body: z.object({ status: z.enum(['active', 'banned']) }),
    query: z.object({}).optional(),
  }),

  deleteReview: z.object({
    params: z.object({ id: z.string().uuid() }),
    query: z.object({}).optional(),
    body: z.object({}).optional(),
  }),
};

export type AdminListUsersSchema = z.infer<typeof AdminValidation.listUsers>;
export type AdminGetUserSchema = z.infer<typeof AdminValidation.getUser>;
export type AdminUpdateUserStatusSchema = z.infer<typeof AdminValidation.updateUserStatus>;
export type AdminDeleteReviewSchema = z.infer<typeof AdminValidation.deleteReview>;
