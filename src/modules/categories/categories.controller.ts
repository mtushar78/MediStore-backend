import { Request, Response } from 'express';
import { sendResponse } from '../../shared/http/sendResponse';
import { ValidatedRequest } from '../../shared/validations/zodMiddleware';
import { CategoriesService } from './categories.service';
import type {
  CategoriesCreateSchema,
  CategoriesListSchema,
  CategoriesRemoveSchema,
  CategoriesUpdateSchema,
} from './categories.validation';

export const CategoriesController = {
  async list(req: Request, res: Response) {
    const { isActive } = (req as ValidatedRequest<CategoriesListSchema>).validated.query ?? {};
    const isActiveBool = isActive === undefined ? true : isActive === 'true';
    const categories = await CategoriesService.listPublic(isActiveBool);
    return sendResponse(res, { statusCode: 200, success: true, data: categories });
  },

  async create(req: Request, res: Response) {
    const { name, description } = (req as ValidatedRequest<CategoriesCreateSchema>).validated.body;
    try {
      const category = await CategoriesService.create({ name, description });
      return sendResponse(res, { statusCode: 201, success: true, data: category });
    } catch (e: any) {
      if (String(e?.code) === 'P2002') {
        return res.status(409).json({ success: false, message: 'Category name/slug already exists' });
      }
      return res.status(500).json({ success: false, message: 'Failed to create category' });
    }
  },

  async update(req: Request, res: Response) {
    const { id } = (req as ValidatedRequest<CategoriesUpdateSchema>).validated.params;
    const { name, description, isActive } = (req as ValidatedRequest<CategoriesUpdateSchema>).validated.body;
    try {
      const category = await CategoriesService.update(id, { name, description, isActive });
      return sendResponse(res, { statusCode: 200, success: true, data: category });
    } catch (e: any) {
      if (String(e?.code) === 'P2025') {
        return res.status(404).json({ success: false, message: 'Category not found' });
      }
      if (String(e?.code) === 'P2002') {
        return res.status(409).json({ success: false, message: 'Category name/slug already exists' });
      }
      return res.status(500).json({ success: false, message: 'Failed to update category' });
    }
  },

  async remove(req: Request, res: Response) {
    const { id } = (req as ValidatedRequest<CategoriesRemoveSchema>).validated.params;
    try {
      await CategoriesService.remove(id);
      return sendResponse(res, { statusCode: 200, success: true, message: 'Category deleted' });
    } catch (e: any) {
      if (String(e?.code) === 'P2025') {
        return res.status(404).json({ success: false, message: 'Category not found' });
      }
      return res.status(500).json({ success: false, message: 'Failed to delete category' });
    }
  },
};
