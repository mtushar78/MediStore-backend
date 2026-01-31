import { OrderStatus, PaymentMethod } from '@prisma/client';
import { Request, Response } from 'express';
import { sendResponse } from '../../shared/http/sendResponse';
import { ValidatedRequest } from '../../shared/validations/zodMiddleware';
import { OrdersService } from './orders.service';
import type {
  OrdersAdminListSchema,
  OrdersAdminUpdateStatusSchema,
  OrdersCancelSchema,
  OrdersCreateSchema,
  OrdersGetOneSchema,
  OrdersListMySchema,
  OrdersSellerListSchema,
  OrdersSellerUpdateStatusSchema,
} from './orders.validation';

export const OrdersController = {
  async create(req: Request, res: Response) {
    const customerId = req.user?.id;
    if (!customerId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const body = (req as ValidatedRequest<OrdersCreateSchema>).validated.body;
    try {
      const order = await OrdersService.createOrder({
        customerId,
        items: body.items,
        shippingAddress: body.shippingAddress,
        paymentMethod: PaymentMethod.COD,
      });
      return sendResponse(res, { statusCode: 201, success: true, data: order });
    } catch (e: any) {
      const code = String(e?.message || '');
      if (code === 'INVALID_MEDICINE') return res.status(400).json({ success: false, message: 'Invalid medicineId' });
      if (code === 'INSUFFICIENT_STOCK') return res.status(400).json({ success: false, message: 'Insufficient stock' });
      return res.status(500).json({ success: false, message: 'Failed to create order' });
    }
  },

  async listMy(req: Request, res: Response) {
    const customerId = req.user?.id;
    if (!customerId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const query = (req as ValidatedRequest<OrdersListMySchema>).validated.query ?? {};
    const status = query.status ? (query.status as OrderStatus) : undefined;
    const result = await OrdersService.listMyOrders(customerId, { status, page: query.page, limit: query.limit });
    return sendResponse(res, { statusCode: 200, success: true, data: result.items, meta: result.meta });
  },

  async getMy(req: Request, res: Response) {
    const customerId = req.user?.id;
    if (!customerId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const { id } = (req as ValidatedRequest<OrdersGetOneSchema>).validated.params;
    const order = await OrdersService.getMyOrder(customerId, id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    return sendResponse(res, { statusCode: 200, success: true, data: order });
  },

  async cancel(req: Request, res: Response) {
    const customerId = req.user?.id;
    if (!customerId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const { id } = (req as ValidatedRequest<OrdersCancelSchema>).validated.params;
    try {
      const result = await OrdersService.cancelMyOrder(customerId, id);
      return sendResponse(res, { statusCode: 200, success: true, data: result });
    } catch (e: any) {
      const code = String(e?.message || '');
      if (code === 'NOT_FOUND') return res.status(404).json({ success: false, message: 'Order not found' });
      if (code === 'CANNOT_CANCEL') return res.status(400).json({ success: false, message: 'Order cannot be cancelled' });
      return res.status(500).json({ success: false, message: 'Failed to cancel order' });
    }
  },

  async sellerList(req: Request, res: Response) {
    const sellerId = req.user?.id;
    if (!sellerId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const query = (req as ValidatedRequest<OrdersSellerListSchema>).validated.query ?? {};
    const status = query.status ? (query.status as OrderStatus) : undefined;
    const result = await OrdersService.listSellerOrderItems(sellerId, { status, page: query.page, limit: query.limit });
    return sendResponse(res, { statusCode: 200, success: true, data: result.items, meta: result.meta });
  },

  async sellerUpdateStatus(req: Request, res: Response) {
    const sellerId = req.user?.id;
    if (!sellerId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const { id } = (req as ValidatedRequest<OrdersSellerUpdateStatusSchema>).validated.params;
    const { status } = (req as ValidatedRequest<OrdersSellerUpdateStatusSchema>).validated.body;
    try {
      const result = await OrdersService.sellerUpdateOrderStatus(sellerId, id, status as OrderStatus);
      return sendResponse(res, { statusCode: 200, success: true, data: result });
    } catch (e: any) {
      const code = String(e?.message || '');
      if (code === 'NOT_ALLOWED') return res.status(403).json({ success: false, message: 'Not allowed' });
      if (code === 'NOT_FOUND') return res.status(404).json({ success: false, message: 'Order not found' });
      return res.status(500).json({ success: false, message: 'Failed to update order status' });
    }
  },

  async adminList(req: Request, res: Response) {
    const query = (req as ValidatedRequest<OrdersAdminListSchema>).validated.query ?? {};
    const status = query.status ? (query.status as OrderStatus) : undefined;
    const result = await OrdersService.adminListOrders({ status, page: query.page, limit: query.limit });
    return sendResponse(res, { statusCode: 200, success: true, data: result.items, meta: result.meta });
  },

  async adminUpdateStatus(req: Request, res: Response) {
    const { id } = (req as ValidatedRequest<OrdersAdminUpdateStatusSchema>).validated.params;
    const { status } = (req as ValidatedRequest<OrdersAdminUpdateStatusSchema>).validated.body;

    try {
      const result = await OrdersService.adminUpdateOrderStatus(id, status as OrderStatus);
      return sendResponse(res, { statusCode: 200, success: true, data: result });
    } catch (e: any) {
      const code = String(e?.message || '');
      if (code === 'NOT_FOUND') return res.status(404).json({ success: false, message: 'Order not found' });
      return res.status(500).json({ success: false, message: 'Failed to update order status' });
    }
  },
};


