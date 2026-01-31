import express from 'express';
import { auth } from '../../app/middlewares/auth';
import { validateRequest } from '../../shared/validations/zodMiddleware';
import { UsersController } from './users.controller';
import { UsersValidation } from './users.validation';

export const usersRouter = express.Router();

usersRouter.get('/me', auth(), UsersController.getMe);
usersRouter.patch('/me', auth(), validateRequest(UsersValidation.updateMe), UsersController.updateMe);
