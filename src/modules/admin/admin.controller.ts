import { UserRole, UserStatus } from '@prisma/client';
import { Request, Response } from 'express';
import { sendResponse } from '../../shared/http/sendResponse';
import { ValidatedRequest } from '../../shared/validations/zodMiddleware';
import { AdminService } from './admin.service';
import type {
  AdminDeleteReviewSchema,
  AdminGetUserSchema,
  AdminListUsersSchema,
  AdminUpdateUserStatusSchema,
} from './admin.validation';

export const AdminController = {
  async listUsers(req: Request, res: Response) {
    const query = (req as ValidatedRequest<AdminListUsersSchema>).validated.query ?? {};
    const result = await AdminService.listUsers({
      role: query.role as UserRole | undefined,
      status: query.status as UserStatus | undefined,
      q: query.q,
      page: query.page,
      limit: query.limit,
      sortBy: query.sortBy,
      sortOrder: query.sortOrder,
    });

    return sendResponse(res, { statusCode: 200, success: true, data: result.users, meta: result.meta });
  },

  async getUser(req: Request, res: Response) {
    const { id } = (req as ValidatedRequest<AdminGetUserSchema>).validated.params;
    const user = await AdminService.getUser(id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    return sendResponse(res, { statusCode: 200, success: true, data: user });
  },

  async updateUserStatus(req: Request, res: Response) {
    const { id } = (req as ValidatedRequest<AdminUpdateUserStatusSchema>).validated.params;
    const { status } = (req as ValidatedRequest<AdminUpdateUserStatusSchema>).validated.body;

    const user = await AdminService.updateUserStatus(id, status as UserStatus);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    return sendResponse(res, { statusCode: 200, success: true, data: user });
  },

  async deleteReview(req: Request, res: Response) {
    const { id } = (req as ValidatedRequest<AdminDeleteReviewSchema>).validated.params;
    const result = await AdminService.deleteReview(id);
    if (!result) return res.status(404).json({ success: false, message: 'Review not found' });
    return sendResponse(res, { statusCode: 200, success: true, message: 'Review deleted', data: result });
  },
};
