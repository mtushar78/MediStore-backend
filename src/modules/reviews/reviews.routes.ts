import express from 'express';
import { auth } from '../../app/middlewares/auth';
import { validateRequest } from '../../shared/validations/zodMiddleware';
import { ReviewsController } from './reviews.controller';
import { ReviewsValidation } from './reviews.validation';

export const reviewsRouter = express.Router();

reviewsRouter.get('/medicines/:id/reviews', validateRequest(ReviewsValidation.listForMedicine), ReviewsController.listForMedicine);

reviewsRouter.post('/', auth('customer'), validateRequest(ReviewsValidation.create), ReviewsController.create);
reviewsRouter.get('/me', auth('customer'), validateRequest(ReviewsValidation.listMe), ReviewsController.listMe);


