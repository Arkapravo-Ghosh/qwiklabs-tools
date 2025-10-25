import express, { Request, Response, Router } from "express";
import apiKeyAuth from "./middlewares/apiKeyAuth";
import loadController from "./controllers/loadController";
import assignmentsController from "./controllers/assignmentsController";
import scrapeController from "./controllers/scrapeController";
import progressController from "./controllers/progressController";
import progressPlaintextController from "./controllers/progressPlaintextController";

const router = Router();

// Index Route
router.get("/", async (req: Request, res: Response): Promise<void> => {
  res.json({ message: "Server is Up and Running!" });
  return;
});

router.post(
  "/load",
  apiKeyAuth,
  express.text({ type: ["text/csv", "application/csv", "application/octet-stream", "text/plain"] }),
  loadController,
);

router.post("/assignments", apiKeyAuth, assignmentsController);

router.get("/scrape", apiKeyAuth, scrapeController);

router.get("/progress", progressController);

router.get("/progress/plaintext", progressPlaintextController);

export default router;
