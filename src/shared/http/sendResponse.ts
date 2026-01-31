import { Response } from 'express';

type SendResponseOptions<T> = {
  statusCode: number;
  success: boolean;
  message?: string;
  data?: T;
  meta?: unknown;
};

export const sendResponse = <T>(res: Response, options: SendResponseOptions<T>) => {
  const { statusCode, success, message, data, meta } = options;

  return res.status(statusCode).json({
    success,
    message,
    data,
    meta,
  });
};
