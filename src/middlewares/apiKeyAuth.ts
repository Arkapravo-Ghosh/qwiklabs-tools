import { NextFunction, Request, Response } from "express";
import { getExpectedApiKey, isApiKeyValid } from "../utils/apiKey";

const apiKeyAuth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const expected = getExpectedApiKey();
  if (!expected) {
    res.status(500).json({ message: "API key is not configured" });
    return;
  };

  if (!isApiKeyValid(req.headers.authorization)) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  };

  await next();
};

export default apiKeyAuth;
