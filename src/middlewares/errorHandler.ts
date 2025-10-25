import { NextFunction, Request, Response } from "express";

/**
 * Middleware to handle errors in the application.
 */
const errorHandler = async (err: Error, req: Request, res: Response, _next: NextFunction): Promise<void> => {
  console.error(err);
  res.status(500).json({
    message: "Internal Server Error",
  });
  return;
};

export default errorHandler;
