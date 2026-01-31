import express from 'express';
import { auth } from '../../app/middlewares/auth';
import { validateRequest } from '../../shared/validations/zodMiddleware';
import { OrdersController } from './orders.controller';
import { OrdersValidation } from './orders.validation';

export const ordersRouter = express.Router();

ordersRouter.post('/', auth('customer'), validateRequest(OrdersValidation.create), OrdersController.create);
ordersRouter.get('/', auth('customer'), validateRequest(OrdersValidation.listMy), OrdersController.listMy);
ordersRouter.get('/:id', auth('customer'), validateRequest(OrdersValidation.getOne), OrdersController.getMy);
ordersRouter.patch('/:id/cancel', auth('customer'), validateRequest(OrdersValidation.cancel), OrdersController.cancel);

ordersRouter.get('/seller', auth('seller'), validateRequest(OrdersValidation.sellerList), OrdersController.sellerList);
ordersRouter.patch(
  '/seller/:id/status',
  auth('seller'),
  validateRequest(OrdersValidation.sellerUpdateStatus),
  OrdersController.sellerUpdateStatus,
);

ordersRouter.get('/admin', auth('admin'), validateRequest(OrdersValidation.adminList), OrdersController.adminList);
ordersRouter.patch(
  '/admin/:id/status',
  auth('admin'),
  validateRequest(OrdersValidation.adminUpdateStatus),
  OrdersController.adminUpdateStatus,
);



