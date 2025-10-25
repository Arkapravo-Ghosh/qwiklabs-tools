import { NextFunction, Request, Response } from "express";
import { buildProgressSummary } from "../services/progressService";

const progressController = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const summary = await buildProgressSummary();
    res.status(200).json(summary);
  } catch (error) {
    if (error instanceof Error && error.message === "Assignments are not configured") {
      res.status(400).json({ message: error.message });
      return;
    };
    next(error);
  };
};

export default progressController;
