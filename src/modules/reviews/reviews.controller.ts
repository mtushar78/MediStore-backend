import { Request, Response } from 'express';
import { sendResponse } from '../../shared/http/sendResponse';
import { ValidatedRequest } from '../../shared/validations/zodMiddleware';
import { ReviewsService } from './reviews.service';
import type { ReviewsCreateSchema, ReviewsListForMedicineSchema, ReviewsListMeSchema } from './reviews.validation';

export const ReviewsController = {
  async listForMedicine(req: Request, res: Response) {
    const { id } = (req as ValidatedRequest<ReviewsListForMedicineSchema>).validated.params;
    const query = (req as ValidatedRequest<ReviewsListForMedicineSchema>).validated.query ?? {};
    const result = await ReviewsService.listForMedicine(id, { page: query.page, limit: query.limit });
    return sendResponse(res, { statusCode: 200, success: true, data: result.items, meta: result.meta });
  },

  async create(req: Request, res: Response) {
    const customerId = req.user?.id;
    if (!customerId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const body = (req as ValidatedRequest<ReviewsCreateSchema>).validated.body;
    try {
      const review = await ReviewsService.create(customerId, body);
      return sendResponse(res, { statusCode: 201, success: true, data: review });
    } catch (e: any) {
      const code = String(e?.message || '');
      if (code === 'ORDER_NOT_FOUND') return res.status(404).json({ success: false, message: 'Order not found' });
      if (code === 'ORDER_NOT_DELIVERED') return res.status(400).json({ success: false, message: 'Order not delivered' });
      if (code === 'NOT_PURCHASED') return res.status(403).json({ success: false, message: 'Not purchased' });
      if (code === 'DUPLICATE_REVIEW') return res.status(409).json({ success: false, message: 'Review already exists' });
      return res.status(500).json({ success: false, message: 'Failed to create review' });
    }
  },

  async listMe(req: Request, res: Response) {
    const customerId = req.user?.id;
    if (!customerId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const query = (req as ValidatedRequest<ReviewsListMeSchema>).validated.query ?? {};
    const result = await ReviewsService.listMe(customerId, { page: query.page, limit: query.limit });
    return sendResponse(res, { statusCode: 200, success: true, data: result.items, meta: result.meta });
  },
};


