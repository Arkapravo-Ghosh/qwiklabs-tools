import { getAssignments } from "./assignmentService";
import { applyScrapeResults, getProfilesForScraping } from "./profileService";
import { SCRAPE_BATCH_SIZE, ScrapeProgressUpdate, scrapeProfilesInBatches } from "../helpers/scrapeHelper";

interface ScrapeState {
  inProgress: boolean;
  queuedAt?: Date;
  startedAt?: Date;
  batchSize: number;
  totalProfiles: number;
  processedProfiles: number;
  totalBatches: number;
  processedBatches: number;
  lastCompletedAt?: Date;
  lastError?: string;
}

export interface ScrapeProgress {
  queuedAt?: Date;
  startedAt?: Date;
  batchSize: number;
  totalProfiles: number;
  processedProfiles: number;
  totalBatches: number;
  processedBatches: number;
  percentage: number;
}

export interface ScrapeStatus {
  status: "queued" | "in-progress";
  progress: ScrapeProgress;
  lastCompletedAt?: Date;
  lastError?: string;
}

const scrapeState: ScrapeState = {
  inProgress: false,
  batchSize: SCRAPE_BATCH_SIZE,
  totalProfiles: 0,
  processedProfiles: 0,
  totalBatches: 0,
  processedBatches: 0,
};

const buildProgressSnapshot = (): ScrapeProgress => {
  const { queuedAt, startedAt, batchSize, totalProfiles, processedProfiles, totalBatches, processedBatches } = scrapeState;
  const percentage = totalBatches > 0
    ? Math.floor((processedBatches / totalBatches) * 100)
    : (totalProfiles > 0 ? Math.floor((processedProfiles / totalProfiles) * 100) : (scrapeState.inProgress ? 0 : 100));

  return {
    queuedAt,
    startedAt,
    batchSize,
    totalProfiles,
    processedProfiles,
    totalBatches,
    processedBatches,
    percentage: Math.min(100, Math.max(0, percentage)),
  };
};

const handleProgressUpdate = (update: ScrapeProgressUpdate) => {
  scrapeState.totalProfiles = update.totalProfiles;
  scrapeState.processedProfiles = update.processedProfiles;
  scrapeState.totalBatches = update.totalBatches;
  scrapeState.processedBatches = update.processedBatches;
  scrapeState.batchSize = update.batchSize;

  const snapshot = buildProgressSnapshot();
  console.log(
    `[Scrape] Progress ${snapshot.percentage}% - batches ${snapshot.processedBatches}/${snapshot.totalBatches}, profiles ${snapshot.processedProfiles}/${snapshot.totalProfiles}`,
  );
};

const runScrapeJob = async (): Promise<void> => {
  scrapeState.startedAt = new Date();

  try {
    const assignments = await getAssignments();
    if (!assignments) {
      console.warn("Scrape skipped: assignments are not configured");
      scrapeState.lastError = "Assignments are not configured";
      return;
    };

    const profiles = await getProfilesForScraping();
    if (profiles.length === 0) {
      console.warn("Scrape skipped: no profiles available");
      scrapeState.lastError = "No profiles available";
      return;
    };

    scrapeState.totalProfiles = profiles.length;
    scrapeState.totalBatches = profiles.length > 0 ? Math.ceil(profiles.length / SCRAPE_BATCH_SIZE) : 0;
    scrapeState.batchSize = SCRAPE_BATCH_SIZE;

    console.log(
      `[Scrape] Started - ${scrapeState.totalProfiles} profiles across ${scrapeState.totalBatches} batches (batch size ${scrapeState.batchSize})`,
    );

    const results = await scrapeProfilesInBatches(profiles, assignments, handleProgressUpdate);
    await applyScrapeResults(results);
    scrapeState.lastCompletedAt = new Date();
    scrapeState.lastError = undefined;

    if (scrapeState.startedAt) {
      const durationMs = scrapeState.lastCompletedAt.getTime() - scrapeState.startedAt.getTime();
      const durationSeconds = (durationMs / 1000).toFixed(1);
      console.log(`[Scrape] Completed in ${durationSeconds}s`);
    } else {
      console.log("[Scrape] Completed");
    };
  } catch (error) {
    console.error("Scrape job failed:", error);
    scrapeState.lastError = error instanceof Error ? error.message : "Unknown scrape error";
  } finally {
    scrapeState.inProgress = false;
    scrapeState.queuedAt = undefined;
    scrapeState.startedAt = undefined;
  };
};

export const queueScrapeJob = async (): Promise<ScrapeStatus> => {
  if (scrapeState.inProgress) {
    const snapshot = buildProgressSnapshot();
    console.log(
      `[Scrape] Status requested - already running (${snapshot.percentage}% complete, batches ${snapshot.processedBatches}/${snapshot.totalBatches})`,
    );

    return {
      status: "in-progress",
      progress: snapshot,
      lastCompletedAt: scrapeState.lastCompletedAt,
      lastError: scrapeState.lastError,
    };
  };

  scrapeState.inProgress = true;
  scrapeState.queuedAt = new Date();
  scrapeState.startedAt = undefined;
  scrapeState.totalProfiles = 0;
  scrapeState.processedProfiles = 0;
  scrapeState.totalBatches = 0;
  scrapeState.processedBatches = 0;
  scrapeState.batchSize = SCRAPE_BATCH_SIZE;
  scrapeState.lastError = undefined;

  const snapshot = buildProgressSnapshot();
  console.log(
    `[Scrape] Job queued at ${scrapeState.queuedAt?.toISOString() ?? "unknown time"}`,
  );

  setImmediate(() => {
    void runScrapeJob();
  });

  return {
    status: "queued",
    progress: snapshot,
    lastCompletedAt: scrapeState.lastCompletedAt,
  };
};
