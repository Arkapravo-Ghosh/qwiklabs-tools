import axios from "axios";
import * as cheerio from "cheerio";
import { ProfileSeed } from "./csvHelper";

export interface ScrapeAssignments {
  assignments: string[];
  arcadeAssignments: string[];
}

export interface ScrapedProfileResult extends ProfileSeed {
  badges: string[];
  badgesCount: number;
  arcadeBadgeProgress: boolean;
  incompleteAssignments: string[];
  incompleteAssignmentsCount: number;
  completedAssignments: string[];
  completedAssignmentsCount: number;
  scrapedAt: Date;
}

export const SCRAPE_BATCH_SIZE = 10;
const BATCH_SIZE = SCRAPE_BATCH_SIZE;

export interface ScrapeProgressUpdate {
  batchSize: number;
  totalProfiles: number;
  processedProfiles: number;
  totalBatches: number;
  processedBatches: number;
}

const scrapeProfileBadges = async (profileUrl: string): Promise<string[]> => {
  const response = await axios.get(profileUrl);
  const $ = cheerio.load(response.data);

  const badges: string[] = [];
  $(".profile-badges .profile-badge").each((_index, element) => {
    const badge = $(element).find(".ql-title-medium").text();
    if (badge) {
      badges.push(badge.trim());
    };
  });

  return badges;
};

const computeProgress = (badges: string[], assignments: ScrapeAssignments) => {
  const completedAssignments = badges.filter((badge) => assignments.assignments.includes(badge));
  const incompleteAssignments = assignments.assignments.filter((assignment) => !badges.includes(assignment));
  const hasArcadeBadge = assignments.arcadeAssignments.some((badge) => badges.includes(badge));

  return {
    badgesCount: badges.length,
    completedAssignments,
    completedAssignmentsCount: completedAssignments.length,
    incompleteAssignments,
    incompleteAssignmentsCount: incompleteAssignments.length,
    arcadeBadgeProgress: hasArcadeBadge,
  };
};

const scrapeSingleProfile = async (profile: ProfileSeed, assignments: ScrapeAssignments): Promise<ScrapedProfileResult> => {
  const badges = await scrapeProfileBadges(profile.profileUrl);
  const progress = computeProgress(badges, assignments);

  return {
    ...profile,
    badges,
    badgesCount: progress.badgesCount,
    arcadeBadgeProgress: progress.arcadeBadgeProgress,
    incompleteAssignments: progress.incompleteAssignments,
    incompleteAssignmentsCount: progress.incompleteAssignmentsCount,
    completedAssignments: progress.completedAssignments,
    completedAssignmentsCount: progress.completedAssignmentsCount,
    scrapedAt: new Date(),
  };
};

export const scrapeProfilesInBatches = async (
  profiles: ProfileSeed[],
  assignments: ScrapeAssignments,
  onProgress?: (update: ScrapeProgressUpdate) => void,
): Promise<ScrapedProfileResult[]> => {
  const results: ScrapedProfileResult[] = [];
  const totalProfiles = profiles.length;
  const totalBatches = totalProfiles > 0 ? Math.ceil(totalProfiles / BATCH_SIZE) : 0;
  let processedBatches = 0;
  let processedProfiles = 0;

  for (let index = 0; index < profiles.length; index += BATCH_SIZE) {
    const batch = profiles.slice(index, index + BATCH_SIZE);
    const batchResults = await Promise.allSettled(batch.map((profile) => scrapeSingleProfile(profile, assignments)));

    batchResults.forEach((result) => {
      if (result.status === "fulfilled") {
        results.push(result.value);
      } else if (result.reason instanceof Error) {
        console.error("Failed to scrape profile:", result.reason.message);
      } else {
        console.error("Failed to scrape profile due to unknown error");
      };
    });

    processedBatches += 1;
    processedProfiles = Math.min(processedProfiles + batch.length, totalProfiles);
    onProgress?.({
      batchSize: BATCH_SIZE,
      totalProfiles,
      processedProfiles,
      totalBatches,
      processedBatches,
    });
  };

  return results;
};
