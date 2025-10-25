import { Document, Model, Schema, model } from "mongoose";

export interface AssignmentConfigDocument extends Document {
  assignments: string[];
  arcadeAssignments: string[];
  createdAt: Date;
  updatedAt: Date;
}

const AssignmentConfigSchema = new Schema<AssignmentConfigDocument>({
  assignments: { type: [String], default: [] },
  arcadeAssignments: { type: [String], default: [] },
}, {
  timestamps: true,
});

const AssignmentConfig: Model<AssignmentConfigDocument> = model<AssignmentConfigDocument>("AssignmentConfig", AssignmentConfigSchema);

export default AssignmentConfig;
