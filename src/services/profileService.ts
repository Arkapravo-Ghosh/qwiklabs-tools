import Profile, { ProfileDocument } from "../models/Profile";
import { ProfileSeed } from "../helpers/csvHelper";
import { ScrapedProfileResult } from "../helpers/scrapeHelper";

const defaultProgress = {
  badges: [] as string[],
  badgesCount: 0,
  arcadeBadgeProgress: false,
  incompleteAssignments: [] as string[],
  incompleteAssignmentsCount: 0,
  completedAssignments: [] as string[],
  completedAssignmentsCount: 0,
  lastScrapedAt: null as Date | null,
};

export const upsertProfiles = async (profiles: ProfileSeed[]): Promise<number> => {
  if (profiles.length === 0) {
    return 0;
  };

  const operations = profiles.map((profile) => ({
    updateOne: {
      filter: { email: profile.email },
      update: {
        $set: {
          name: profile.name,
          profileUrl: profile.profileUrl,
          "progress.badges": defaultProgress.badges,
          "progress.badgesCount": defaultProgress.badgesCount,
          "progress.arcadeBadgeProgress": defaultProgress.arcadeBadgeProgress,
          "progress.incompleteAssignments": defaultProgress.incompleteAssignments,
          "progress.incompleteAssignmentsCount": defaultProgress.incompleteAssignmentsCount,
          "progress.completedAssignments": defaultProgress.completedAssignments,
          "progress.completedAssignmentsCount": defaultProgress.completedAssignmentsCount,
          "progress.lastScrapedAt": defaultProgress.lastScrapedAt,
        },
      },
      upsert: true,
    },
  }));

  const result = await Profile.bulkWrite(operations, { ordered: false });
  return (result.upsertedCount ?? 0) + (result.modifiedCount ?? 0);
};

export const getProfilesForScraping = async (): Promise<ProfileSeed[]> => {
  const data = await Profile.find({}, { name: 1, email: 1, profileUrl: 1 }).lean();
  return data.map((profile) => ({
    name: profile.name,
    email: profile.email,
    profileUrl: profile.profileUrl,
  }));
};

export const applyScrapeResults = async (results: ScrapedProfileResult[]): Promise<void> => {
  if (results.length === 0) {
    return;
  };

  const operations = results.map((profile) => ({
    updateOne: {
      filter: { email: profile.email },
      update: {
        $set: {
          name: profile.name,
          profileUrl: profile.profileUrl,
          "progress.badges": profile.badges,
          "progress.badgesCount": profile.badgesCount,
          "progress.arcadeBadgeProgress": profile.arcadeBadgeProgress,
          "progress.incompleteAssignments": profile.incompleteAssignments,
          "progress.incompleteAssignmentsCount": profile.incompleteAssignmentsCount,
          "progress.completedAssignments": profile.completedAssignments,
          "progress.completedAssignmentsCount": profile.completedAssignmentsCount,
          "progress.lastScrapedAt": profile.scrapedAt,
        },
      },
      upsert: true,
    },
  }));

  await Profile.bulkWrite(operations, { ordered: false });
};

export const getProfilesWithProgress = async (): Promise<ProfileDocument[]> => {
  return await Profile.find();
};
