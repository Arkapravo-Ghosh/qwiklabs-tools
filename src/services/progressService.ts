import { getAssignments } from "./assignmentService";
import { getProfilesWithProgress, updateProfilesRank } from "./profileService";
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

const normalizeRank = (value: unknown): number => {
  return Number.isFinite(value) ? Number(value) : 0;
};

const sortByRankThenName = (a: ProfileDocument, b: ProfileDocument): number => {
  const rankA = normalizeRank(a.progress.rank);
  const rankB = normalizeRank(b.progress.rank);
  const rankDiff = rankA - rankB;
  if (rankDiff !== 0) {
    return rankDiff;
  };

  return a.name.localeCompare(b.name);
};

const ensureCompletionRanks = async (profiles: ProfileDocument[], totalAssignments: number): Promise<void> => {
  if (totalAssignments <= 0) {
    return;
  };

  const completed = profiles.filter((profile) => profile.progress.completedAssignmentsCount === totalAssignments && profile.progress.arcadeBadgeProgress);
  if (completed.length === 0) {
    return;
  };

  const unranked = completed.filter((profile) => normalizeRank(profile.progress.rank) === 0);
  if (unranked.length === 0) {
    return;
  };

  const maxRank = completed.reduce((max, profile) => {
    const rank = normalizeRank(profile.progress.rank);
    if (rank > max) {
      return rank;
    };
    return max;
  }, 0);

  const nextRank = maxRank > 0 ? maxRank + 1 : 1;
  const emails = unranked.map((profile) => profile.email);
  await updateProfilesRank(emails, nextRank);
  unranked.forEach((profile) => {
    profile.progress.rank = nextRank;
  });
};

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

  await ensureCompletionRanks(profiles, assignments.assignments.length);

  const completedAllProfiles = profiles
    .filter((profile) => profile.progress.completedAssignmentsCount === assignments.assignments.length && profile.progress.arcadeBadgeProgress)
    .sort(sortByRankThenName);
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
      completedAll: completedAllProfiles.length,
      completedSome: completedSome.length,
      completedNone: completedNone.length,
      arcadeBadge: arcadeBadge.length,
    },
    distribution: buildDistribution(profiles),
    completedAll: mapSimple(completedAllProfiles),
    completedAllWithoutArcade: mapSimple(profiles.filter((profile) => profile.progress.completedAssignmentsCount === assignments.assignments.length && !profile.progress.arcadeBadgeProgress)),
    assignments: assignmentStats,
    remainingOneBadge,
    assignmentsConfigured: assignments.assignments,
    lastScrapedAt: findMostRecentScrape(profiles),
  };
};
