import { NextFunction, Request, Response } from "express";
import { saveAssignments } from "../services/assignmentService";

const assignmentsController = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.body || typeof req.body !== "object") {
      res.status(400).json({ message: "JSON payload is required" });
      return;
    };

    const payload = req.body as Record<string, unknown>;

    if (!Array.isArray(payload.assignments)) {
      res.status(400).json({ message: "assignments must be an array of strings" });
      return;
    };

    const result = await saveAssignments({
      assignments: payload.assignments as string[],
      arcade_assignments: Array.isArray(payload.arcade_assignments) ? payload.arcade_assignments as string[] : [],
    });

    res.status(200).json({
      message: "Assignments saved",
      assignmentsCount: result.assignments.length,
      arcadeAssignmentsCount: result.arcadeAssignments.length,
      updatedAt: result.updatedAt,
    });
  } catch (error) {
    next(error);
  };
};

export default assignmentsController;
