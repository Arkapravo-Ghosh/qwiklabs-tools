import { NextFunction, Request, Response } from "express";
import { buildProgressSummary } from "../services/progressService";
import { formatProgressSummary } from "../helpers/progressFormatter";

const progressPlaintextController = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const summary = await buildProgressSummary();
    const report = formatProgressSummary(summary);
    res.type("text/plain").status(200).send(report);
  } catch (error) {
    if (error instanceof Error && error.message === "Assignments are not configured") {
      res.type("text/plain").status(400).send(error.message);
      return;
    };
    next(error);
  };
};

export default progressPlaintextController;
