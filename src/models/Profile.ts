import { Document, Model, Schema, model } from "mongoose";

export interface ProfileProgress {
  badges: string[];
  badgesCount: number;
  arcadeBadgeProgress: boolean;
  incompleteAssignments: string[];
  incompleteAssignmentsCount: number;
  completedAssignments: string[];
  completedAssignmentsCount: number;
  lastScrapedAt?: Date | null;
}

export interface ProfileDocument extends Document {
  name: string;
  email: string;
  profileUrl: string;
  progress: ProfileProgress;
  createdAt: Date;
  updatedAt: Date;
}

const ProgressSchema = new Schema<ProfileProgress>({
  badges: { type: [String], default: [] },
  badgesCount: { type: Number, default: 0 },
  arcadeBadgeProgress: { type: Boolean, default: false },
  incompleteAssignments: { type: [String], default: [] },
  incompleteAssignmentsCount: { type: Number, default: 0 },
  completedAssignments: { type: [String], default: [] },
  completedAssignmentsCount: { type: Number, default: 0 },
  lastScrapedAt: { type: Date },
}, { _id: false });

const ProfileSchema = new Schema<ProfileDocument>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  profileUrl: { type: String, required: true },
  progress: { type: ProgressSchema, default: () => ({}) },
}, {
  timestamps: true,
});

const Profile: Model<ProfileDocument> = model<ProfileDocument>("Profile", ProfileSchema);

export default Profile;
