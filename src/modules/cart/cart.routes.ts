import express from 'express';
import { auth } from '../../app/middlewares/auth';
import { validateRequest } from '../../shared/validations/zodMiddleware';
import { CartController } from './cart.controller';
import { CartValidation } from './cart.validation';

export const cartRouter = express.Router();

cartRouter.get('/', auth('customer'), CartController.getCart);
cartRouter.post('/items', auth('customer'), validateRequest(CartValidation.addItem), CartController.addItem);
cartRouter.patch('/items/:medicineId', auth('customer'), validateRequest(CartValidation.updateItem), CartController.updateItem);
cartRouter.delete('/items/:medicineId', auth('customer'), validateRequest(CartValidation.removeItem), CartController.removeItem);
cartRouter.delete('/', auth('customer'), CartController.clear);


