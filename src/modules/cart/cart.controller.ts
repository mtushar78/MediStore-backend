import { Request, Response } from 'express';
import { sendResponse } from '../../shared/http/sendResponse';
import { ValidatedRequest } from '../../shared/validations/zodMiddleware';
import { CartService } from './cart.service';
import type { CartAddItemSchema, CartRemoveItemSchema, CartUpdateItemSchema } from './cart.validation';

export const CartController = {
  async getCart(req: Request, res: Response) {
    const customerId = req.user?.id;
    if (!customerId) return res.status(401).json({ success: false, message: 'Unauthorized' });
    const cart = await CartService.getCart(customerId);
    return sendResponse(res, { statusCode: 200, success: true, data: cart });
  },

  async addItem(req: Request, res: Response) {
    const customerId = req.user?.id;
    if (!customerId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const { medicineId, quantity } = (req as ValidatedRequest<CartAddItemSchema>).validated.body;
    try {
      const cart = await CartService.addItem(customerId, medicineId, quantity);
      return sendResponse(res, { statusCode: 200, success: true, data: cart });
    } catch {
      return res.status(400).json({ success: false, message: 'Failed to add item to cart' });
    }
  },

  async updateItem(req: Request, res: Response) {
    const customerId = req.user?.id;
    if (!customerId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const { medicineId } = (req as ValidatedRequest<CartUpdateItemSchema>).validated.params;
    const { quantity } = (req as ValidatedRequest<CartUpdateItemSchema>).validated.body;
    try {
      const cart = await CartService.updateItem(customerId, medicineId, quantity);
      return sendResponse(res, { statusCode: 200, success: true, data: cart });
    } catch {
      return res.status(404).json({ success: false, message: 'Cart item not found' });
    }
  },

  async removeItem(req: Request, res: Response) {
    const customerId = req.user?.id;
    if (!customerId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const { medicineId } = (req as ValidatedRequest<CartRemoveItemSchema>).validated.params;
    try {
      const cart = await CartService.removeItem(customerId, medicineId);
      return sendResponse(res, { statusCode: 200, success: true, data: cart });
    } catch {
      return res.status(404).json({ success: false, message: 'Cart item not found' });
    }
  },

  async clear(req: Request, res: Response) {
    const customerId = req.user?.id;
    if (!customerId) return res.status(401).json({ success: false, message: 'Unauthorized' });
    await CartService.clear(customerId);
    return sendResponse(res, { statusCode: 200, success: true, message: 'Cart cleared' });
  },
};


