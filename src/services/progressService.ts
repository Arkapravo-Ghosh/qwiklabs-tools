import { getAssignments } from "./assignmentService";
import { getProfilesWithProgress } from "./profileService";
import { ProfileDocument } from "../models/Profile";

export interface ProgressSummary {
  totals: {
    profiles: number;
    completedAll: number;
    completedSome: number;
    completedNone: number;
    arcadeBadge: number;
  };
  distribution: Record<number, number>;
  completedAll: Array<{ name: string; email: string }>;
  completedAllWithoutArcade: Array<{ name: string; email: string }>;
  assignments: Array<{ name: string; completedCount: number }>;
  remainingOneBadge: Array<{ name: string; email: string; pendingAssignment: string | null }>;
  assignmentsConfigured: string[];
  lastScrapedAt?: Date;
}

const buildDistribution = (profiles: ProfileDocument[]): Record<number, number> => {
  const distribution: Record<number, number> = {};
  profiles.forEach((profile) => {
    const count = profile.progress.completedAssignmentsCount || 0;
    distribution[count] = (distribution[count] ?? 0) + 1;
  });
  return distribution;
};

const mapSimple = (profiles: ProfileDocument[]) => profiles.map((profile) => ({
  name: profile.name,
  email: profile.email,
}));

const findMostRecentScrape = (profiles: ProfileDocument[]): Date | undefined => {
  let latest: Date | undefined;
  profiles.forEach((profile) => {
    const last = profile.progress.lastScrapedAt;
    if (!last) {
      return;
    };
    if (!latest || last > latest) {
      latest = last;
    };
  });
  return latest;
};

export const buildProgressSummary = async (): Promise<ProgressSummary> => {
  const assignments = await getAssignments();
  if (!assignments) {
    throw new Error("Assignments are not configured");
  };

  const profiles = await getProfilesWithProgress();

  const completedAll = profiles.filter((profile) => profile.progress.completedAssignmentsCount === assignments.assignments.length && profile.progress.arcadeBadgeProgress);
  const completedSome = profiles.filter((profile) => profile.progress.completedAssignmentsCount > 0 && profile.progress.completedAssignmentsCount < assignments.assignments.length);
  const completedNone = profiles.filter((profile) => profile.progress.completedAssignmentsCount === 0 && !profile.progress.arcadeBadgeProgress);
  const arcadeBadge = profiles.filter((profile) => profile.progress.arcadeBadgeProgress);

  const remainingOneBadge = profiles
    .filter((profile) => profile.progress.completedAssignmentsCount === assignments.assignments.length - 1)
    .map((profile) => ({
      name: profile.name,
      email: profile.email,
      pendingAssignment: profile.progress.incompleteAssignments[0] ?? null,
    }));

  const assignmentStats = assignments.assignments.map((assignmentName) => ({
    name: assignmentName,
    completedCount: profiles.filter((profile) => profile.progress.completedAssignments.includes(assignmentName)).length,
  }));

  return {
    totals: {
      profiles: profiles.length,
      completedAll: completedAll.length,
      completedSome: completedSome.length,
      completedNone: completedNone.length,
      arcadeBadge: arcadeBadge.length,
    },
    distribution: buildDistribution(profiles),
    completedAll: mapSimple(completedAll),
    completedAllWithoutArcade: mapSimple(profiles.filter((profile) => profile.progress.completedAssignmentsCount === assignments.assignments.length && !profile.progress.arcadeBadgeProgress)),
    assignments: assignmentStats,
    remainingOneBadge,
    assignmentsConfigured: assignments.assignments,
    lastScrapedAt: findMostRecentScrape(profiles),
  };
};
