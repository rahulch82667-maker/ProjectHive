import { Response } from 'express';

interface ResponseOptions {
  res: Response;
  statusCode: number;
  success: boolean;
  message: string;
  data?: any;
}

export const sendResponse = ({ res, statusCode, success, message, data }: ResponseOptions) => {
  return res.status(statusCode).json({
    success,
    message,
    data,
  });
};
