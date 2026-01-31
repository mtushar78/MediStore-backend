import express from 'express';
import { auth } from '../../app/middlewares/auth';
import { validateRequest } from '../../shared/validations/zodMiddleware';
import { CategoriesController } from './categories.controller';
import { CategoriesValidation } from './categories.validation';

export const categoriesRouter = express.Router();

categoriesRouter.get('/', validateRequest(CategoriesValidation.list), CategoriesController.list);

categoriesRouter.post('/', auth('admin'), validateRequest(CategoriesValidation.create), CategoriesController.create);

categoriesRouter.patch(
  '/:id',
  auth('admin'),
  validateRequest(CategoriesValidation.update),
  CategoriesController.update,
);

categoriesRouter.delete(
  '/:id',
  auth('admin'),
  validateRequest(CategoriesValidation.remove),
  CategoriesController.remove,
);
