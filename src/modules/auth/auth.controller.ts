import { Request, Response } from 'express';
import { sendResponse } from '../../shared/http/sendResponse';
import { ValidatedRequest } from '../../shared/validations/zodMiddleware';
import { AuthService } from './auth.service';
import type { LoginRequestSchema, RegisterRequestSchema } from './auth.validation';

export const AuthController = {
  async register(req: Request, res: Response) {
    const { name, email, password, role } = (req as ValidatedRequest<RegisterRequestSchema>).validated.body;
    try {
      const data = await AuthService.register({ name, email, password, role });
      return sendResponse(res, {
        statusCode: 201,
        success: true,
        data,
      });
    } catch (e: any) {
      if (String(e?.code) === 'P2002') {
        return res.status(409).json({ success: false, message: 'Email already exists' });
      }
      return res.status(500).json({ success: false, message: 'Registration failed' });
    }
  },

  async login(req: Request, res: Response) {
    const { email, password } = (req as ValidatedRequest<LoginRequestSchema>).validated.body;
    try {
      const data = await AuthService.login({ email, password });
      return sendResponse(res, {
        statusCode: 200,
        success: true,
        data,
      });
    } catch (e: any) {
      const code = String(e?.message || '');
      if (code === 'INVALID_CREDENTIALS') {
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
      }
      if (code === 'USER_BANNED') {
        return res.status(403).json({ success: false, message: 'User banned' });
      }
      return res.status(500).json({ success: false, message: 'Login failed' });
    }
  },
};
