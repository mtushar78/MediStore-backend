import express from 'express';
import { validateRequest } from '../../shared/validations/zodMiddleware';
import { AuthController } from './auth.controller';
import { AuthValidation } from './auth.validation';

export const authRouter = express.Router();

authRouter.post('/register', validateRequest(AuthValidation.register), AuthController.register as express.RequestHandler);
authRouter.post('/login', validateRequest(AuthValidation.login), AuthController.login as express.RequestHandler);
