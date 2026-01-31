import { z } from 'zod';

export const AuthValidation = {
  register: z.object({
    body: z.object({
      name: z.string().min(1),
      email: z.string().email(),
      password: z.string().min(6),
      role: z.enum(['customer', 'seller']),
    }),
    params: z.object({}).optional(),
    query: z.object({}).optional(),
  }),

  login: z.object({
    body: z.object({
      email: z.string().email(),
      password: z.string().min(1),
    }),
    params: z.object({}).optional(),
    query: z.object({}).optional(),
  }),
};

export type RegisterRequestSchema = z.infer<typeof AuthValidation.register>;
export type LoginRequestSchema = z.infer<typeof AuthValidation.login>;


