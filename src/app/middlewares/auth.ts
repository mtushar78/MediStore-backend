import { NextFunction, Request, Response } from 'express';
import { verifyJwt } from '../../shared/auth/jwt';

export type AuthUser = {
  id: string;
  role: string;
};

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export const auth = (...allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader?.startsWith('Bearer ')) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const token = authHeader.slice('Bearer '.length);
      const secret = process.env.JWT_ACCESS_SECRET;
      if (!secret) {
        return res.status(500).json({ success: false, message: 'JWT secret not configured' });
      }

      const payload = verifyJwt(token, secret);
      req.user = { id: payload.sub, role: payload.role };

      if (allowedRoles.length && !allowedRoles.includes(req.user.role)) {
        return res.status(403).json({ success: false, message: 'Forbidden' });
      }

      return next();
    } catch {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
  };
};
