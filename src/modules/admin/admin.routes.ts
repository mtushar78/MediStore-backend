import express from 'express';
import { auth } from '../../app/middlewares/auth';
import { validateRequest } from '../../shared/validations/zodMiddleware';
import { AdminController } from './admin.controller';
import { AdminValidation } from './admin.validation';

export const adminRouter = express.Router();

adminRouter.get('/users', auth('admin'), validateRequest(AdminValidation.listUsers), AdminController.listUsers);
adminRouter.get('/users/:id', auth('admin'), validateRequest(AdminValidation.getUser), AdminController.getUser);
adminRouter.patch(
  '/users/:id/status',
  auth('admin'),
  validateRequest(AdminValidation.updateUserStatus),
  AdminController.updateUserStatus,
);

adminRouter.delete(
  '/reviews/:id',
  auth('admin'),
  validateRequest(AdminValidation.deleteReview),
  AdminController.deleteReview,
);
