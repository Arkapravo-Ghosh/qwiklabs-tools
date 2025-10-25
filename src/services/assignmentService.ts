import AssignmentConfig, { AssignmentConfigDocument } from "../models/AssignmentConfig";

export interface AssignmentPayload {
  assignments: string[];
  arcade_assignments?: string[];
}

export interface AssignmentData {
  assignments: string[];
  arcadeAssignments: string[];
}

const normalizeList = (input: unknown): string[] => {
  if (!Array.isArray(input)) {
    return [];
  };
  return input
    .map((value) => (typeof value === "string" ? value.trim() : ""))
    .filter((value) => value.length > 0);
};

export const saveAssignments = async (payload: AssignmentPayload): Promise<AssignmentConfigDocument> => {
  const assignments = normalizeList(payload.assignments);
  const arcadeAssignments = normalizeList(payload.arcade_assignments ?? []);

  if (assignments.length === 0) {
    throw new Error("Assignments list cannot be empty");
  };

  const update: AssignmentData = {
    assignments,
    arcadeAssignments,
  };

  const result = await AssignmentConfig.findOneAndUpdate({}, update, {
    upsert: true,
    new: true,
    setDefaultsOnInsert: true,
  });

  if (!result) {
    throw new Error("Unable to save assignments");
  };

  return result;
};

export const getAssignments = async (): Promise<AssignmentData | null> => {
  const config = await AssignmentConfig.findOne().lean();
  if (!config) {
    return null;
  };
  return {
    assignments: config.assignments,
    arcadeAssignments: config.arcadeAssignments,
  };
};
