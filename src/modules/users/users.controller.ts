import { Request, Response } from 'express';
import { sendResponse } from '../../shared/http/sendResponse';
import { ValidatedRequest } from '../../shared/validations/zodMiddleware';
import { UsersService } from './users.service';
import type { UpdateMeRequestSchema } from './users.validation';

export const UsersController = {
  async getMe(req: Request, res: Response) {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const user = await UsersService.getMe(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    return sendResponse(res, {
      statusCode: 200,
      success: true,
      data: user,
    });
  },

  async updateMe(req: Request, res: Response) {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const { name, phone, address } = (req as ValidatedRequest<UpdateMeRequestSchema>).validated.body;

    const user = await UsersService.updateMe(userId, {
      name,
      phone,
      address,
    });

    return sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Profile updated',
      data: user,
    });
  },
};
