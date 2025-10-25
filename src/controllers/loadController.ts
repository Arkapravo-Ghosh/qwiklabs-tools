import { NextFunction, Request, Response } from "express";
import { parseProfilesFromCsv } from "../helpers/csvHelper";
import { upsertProfiles } from "../services/profileService";

const loadController = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const rawBody = typeof req.body === "string" ? req.body : Buffer.isBuffer(req.body) ? req.body.toString("utf8") : "";

    if (!rawBody || rawBody.trim().length === 0) {
      res.status(400).json({ message: "CSV payload is required" });
      return;
    };

    const profiles = await parseProfilesFromCsv(rawBody);
    const processed = await upsertProfiles(profiles);

    res.status(200).json({
      message: "Profiles processed",
      received: profiles.length,
      insertedOrUpdated: processed,
    });
  } catch (error) {
    next(error);
  };
};

export default loadController;
