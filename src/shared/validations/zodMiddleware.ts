import { NextFunction, Request, RequestHandler, Response } from 'express';
import { ZodError, ZodSchema } from 'zod';

export const validateRequest = <T>(schema: ZodSchema<T>): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = schema.parse({
        body: req.body,
        params: req.params,
        query: req.query,
      });

      (req as Request & { validated: T }).validated = parsed;
      return next();
    } catch (e) {
      if (e instanceof ZodError) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          error: {
            code: 'VALIDATION_ERROR',
            details: e.issues.map((issue) => ({
              path: issue.path.join('.'),
              issue: issue.message,
            })),
          },
        });
      }
      return res.status(400).json({ success: false, message: 'Validation failed' });
    }
  };
};

export type ValidatedRequest<T> = Request & { validated: T };
