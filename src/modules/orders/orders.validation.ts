import { z } from 'zod';

const orderItemSchema = z.object({
  medicineId: z.string().uuid(),
  quantity: z.number().int().min(1),
});

const shippingAddressSchema = z.object({
  name: z.string().min(1),
  phone: z.string().min(1),
  addressLine1: z.string().min(1),
  addressLine2: z.string().optional(),
  city: z.string().min(1),
  area: z.string().min(1),
  postalCode: z.string().optional(),
  notes: z.string().optional(),
});

export const OrdersValidation = {
  create: z.object({
    body: z.object({
      items: z.array(orderItemSchema).min(1),
      shippingAddress: shippingAddressSchema,
      paymentMethod: z.literal('COD'),
    }),
    params: z.object({}).optional(),
    query: z.object({}).optional(),
  }),

  listMy: z.object({
    query: z
      .object({
        status: z.enum(['PLACED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED']).optional(),
        page: z.coerce.number().int().positive().optional(),
        limit: z.coerce.number().int().positive().max(100).optional(),
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

  cancel: z.object({
    params: z.object({ id: z.string().uuid() }),
    body: z.object({}).optional(),
    query: z.object({}).optional(),
  }),

  sellerList: z.object({
    query: z
      .object({
        status: z.enum(['PLACED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED']).optional(),
        page: z.coerce.number().int().positive().optional(),
        limit: z.coerce.number().int().positive().max(100).optional(),
      })
      .optional(),
    params: z.object({}).optional(),
    body: z.object({}).optional(),
  }),

  sellerUpdateStatus: z.object({
    params: z.object({ id: z.string().uuid() }),
    body: z.object({
      status: z.enum(['PROCESSING', 'SHIPPED', 'DELIVERED']),
    }),
    query: z.object({}).optional(),
  }),

  adminList: z.object({
    query: z
      .object({
        status: z.enum(['PLACED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED']).optional(),
        page: z.coerce.number().int().positive().optional(),
        limit: z.coerce.number().int().positive().max(100).optional(),
      })
      .optional(),
    params: z.object({}).optional(),
    body: z.object({}).optional(),
  }),

  adminUpdateStatus: z.object({
    params: z.object({ id: z.string().uuid() }),
    body: z.object({
      status: z.enum(['PLACED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED']),
    }),
    query: z.object({}).optional(),
  }),
};

export type OrdersCreateSchema = z.infer<typeof OrdersValidation.create>;
export type OrdersListMySchema = z.infer<typeof OrdersValidation.listMy>;
export type OrdersGetOneSchema = z.infer<typeof OrdersValidation.getOne>;
export type OrdersCancelSchema = z.infer<typeof OrdersValidation.cancel>;
export type OrdersSellerListSchema = z.infer<typeof OrdersValidation.sellerList>;
export type OrdersSellerUpdateStatusSchema = z.infer<typeof OrdersValidation.sellerUpdateStatus>;
export type OrdersAdminListSchema = z.infer<typeof OrdersValidation.adminList>;
export type OrdersAdminUpdateStatusSchema = z.infer<typeof OrdersValidation.adminUpdateStatus>;


