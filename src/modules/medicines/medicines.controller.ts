import { Request, Response } from 'express';
import { sendResponse } from '../../shared/http/sendResponse';
import { ValidatedRequest } from '../../shared/validations/zodMiddleware';
import { MedicinesService } from './medicines.service';
import type {
  MedicinesAdminUpdateSchema,
  MedicinesCreateSchema,
  MedicinesGetOneSchema,
  MedicinesListPublicSchema,
  MedicinesUpdateSchema,
} from './medicines.validation';

export const MedicinesController = {
  async listPublic(req: Request, res: Response) {
    const query = (req as ValidatedRequest<MedicinesListPublicSchema>).validated.query ?? {};
    const inStockBool = query.inStock === 'true' ? true : query.inStock === 'false' ? false : undefined;

    const result = await MedicinesService.listPublic({
      q: query.q,
      categoryId: query.categoryId,
      manufacturer: query.manufacturer,
      minPrice: query.minPrice,
      maxPrice: query.maxPrice,
      inStock: inStockBool,
      sellerId: query.sellerId,
      page: query.page,
      limit: query.limit,
      sortBy: query.sortBy,
      sortOrder: query.sortOrder,
    });

    return sendResponse(res, { statusCode: 200, success: true, data: result.data, meta: result.meta });
  },

  async getOnePublic(req: Request, res: Response) {
    const { id } = (req as ValidatedRequest<MedicinesGetOneSchema>).validated.params;
    const medicine = await MedicinesService.getPublic(id);
    if (!medicine) return res.status(404).json({ success: false, message: 'Medicine not found' });
    return sendResponse(res, { statusCode: 200, success: true, data: medicine });
  },

  async sellerCreate(req: Request, res: Response) {
    const sellerId = req.user?.id;
    if (!sellerId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const payload = (req as ValidatedRequest<MedicinesCreateSchema>).validated.body;
    try {
      const medicine = await MedicinesService.createForSeller(sellerId, {
        name: payload.name,
        slug: payload.slug,
        categoryId: payload.categoryId,
        manufacturer: payload.manufacturer,
        unit: payload.unit,
        price: payload.price,
        stock: payload.stock,
        images: payload.images,
        description: payload.description,
        isActive: payload.isActive ?? true,
      });
      return sendResponse(res, { statusCode: 201, success: true, data: medicine });
    } catch (e: any) {
      if (String(e?.code) === 'P2025') return res.status(400).json({ success: false, message: 'Invalid categoryId' });
      if (String(e?.code) === 'P2002') return res.status(409).json({ success: false, message: 'Medicine slug already exists' });
      return res.status(500).json({ success: false, message: 'Failed to create medicine' });
    }
  },

  async sellerList(req: Request, res: Response) {
    const sellerId = req.user?.id;
    if (!sellerId) return res.status(401).json({ success: false, message: 'Unauthorized' });
    const medicines = await MedicinesService.listForSeller(sellerId);
    return sendResponse(res, { statusCode: 200, success: true, data: medicines });
  },

  async sellerUpdate(req: Request, res: Response) {
    const sellerId = req.user?.id;
    if (!sellerId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const { id } = (req as ValidatedRequest<MedicinesUpdateSchema>).validated.params;
    const body = (req as ValidatedRequest<MedicinesUpdateSchema>).validated.body;
    try {
      const medicine = await MedicinesService.updateForSeller(sellerId, id, {
        name: body.name,
        slug: body.slug,
        manufacturer: body.manufacturer,
        unit: body.unit,
        price: body.price,
        stock: body.stock,
        images: body.images,
        description: body.description,
        isActive: body.isActive,
        categoryId: body.categoryId,
      });
      return sendResponse(res, { statusCode: 200, success: true, data: medicine });
    } catch (e: any) {
      if (String(e?.message) === 'NOT_FOUND') return res.status(404).json({ success: false, message: 'Medicine not found' });
      if (String(e?.code) === 'P2002') return res.status(409).json({ success: false, message: 'Medicine slug already exists' });
      return res.status(500).json({ success: false, message: 'Failed to update medicine' });
    }
  },

  async sellerDelete(req: Request, res: Response) {
    const sellerId = req.user?.id;
    if (!sellerId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const { id } = (req as ValidatedRequest<MedicinesGetOneSchema>).validated.params;
    try {
      await MedicinesService.deleteForSeller(sellerId, id);
      return sendResponse(res, { statusCode: 200, success: true, message: 'Medicine deleted' });
    } catch (e: any) {
      if (String(e?.message) === 'NOT_FOUND') return res.status(404).json({ success: false, message: 'Medicine not found' });
      return res.status(500).json({ success: false, message: 'Failed to delete medicine' });
    }
  },

  async adminList(req: Request, res: Response) {
    const medicines = await MedicinesService.listAdmin();
    return sendResponse(res, { statusCode: 200, success: true, data: medicines });
  },

  async adminUpdate(req: Request, res: Response) {
    const { id } = (req as ValidatedRequest<MedicinesAdminUpdateSchema>).validated.params;
    const { isActive, categoryId, stock, price } = (req as ValidatedRequest<MedicinesAdminUpdateSchema>).validated.body;

    try {
      const medicine = await MedicinesService.adminUpdate(id, { isActive, categoryId, stock, price });
      return sendResponse(res, { statusCode: 200, success: true, data: medicine });
    } catch (e: any) {
      if (String(e?.message) === 'NOT_FOUND') return res.status(404).json({ success: false, message: 'Medicine not found' });
      return res.status(500).json({ success: false, message: 'Failed to update medicine' });
    }
  },
};
