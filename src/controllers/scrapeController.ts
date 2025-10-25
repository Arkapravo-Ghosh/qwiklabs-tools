import { NextFunction, Request, Response } from "express";
import { queueScrapeJob } from "../services/scrapeService";

const scrapeController = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await queueScrapeJob();

    if (result.status === "queued") {
      res.status(202).json({
        message: "Scrape job queued",
        progress: result.progress,
        lastCompletedAt: result.lastCompletedAt,
      });
      return;
    };

    res.status(200).json({
      message: "Scrape in progress",
      progress: result.progress,
      lastCompletedAt: result.lastCompletedAt,
      lastError: result.lastError,
    });
  } catch (error) {
    next(error);
  };
};

export default scrapeController;
