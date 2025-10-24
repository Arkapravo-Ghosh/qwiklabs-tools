import axios from "axios";
import * as cheerio from "cheerio";
import fs from "fs";
import data from "./assets/profiles.json";
import assignments from "./assets/assignments.json";

const BATCH_SIZE = 10;

const typedAssignments: string[] = assignments.assignments;
const arcadeAssignments: string[] = assignments.arcade_assignments;

const scrapeProfile = async (url: string): Promise<string[]> => {
  const response = await axios.get(url);
  const $ = cheerio.load(response.data);

  const badges: string[] = [];
  $(".profile-badges .profile-badge").each((index, element) => {
    const badge = $(element).find(".ql-title-medium").text();
    badges.push(badge.trim());
  });

  return badges;
};

interface ProfileData {
  name: string;
  email: string;
  profile_url: string;
  badges_count: number;
  arcade_badge_progress: boolean;
  incomplete_assignments_count: number;
  completed_assignments_count: number;
  badges: string[];
  incomplete_assignments: string[];
  completed_assignments: string[];
};

const processProfile = async (profile: any): Promise<ProfileData> => {
  const badges: string[] = await scrapeProfile(profile["Google Cloud Skills Boost Profile URL"]);
  const getArcadeProgress = (badges: string[]): boolean => {
    for (const arcadeBadge of arcadeAssignments) {
      if (badges.includes(arcadeBadge)) {
        return true;
      };
    };
    return false;
  };
  const completed_assignments = badges.filter((badge) => typedAssignments.includes(badge));
  const incomplete_assignments = typedAssignments.filter((assignment) => !badges.includes(assignment));

  const scraped_data: ProfileData = {
    name: profile["User Name"],
    email: profile["User Email"],
    profile_url: profile["Google Cloud Skills Boost Profile URL"],
    badges_count: badges.length,
    arcade_badge_progress: getArcadeProgress(badges),
    incomplete_assignments_count: incomplete_assignments.length,
    completed_assignments_count: completed_assignments.length,
    badges: badges,
    incomplete_assignments: incomplete_assignments,
    completed_assignments: completed_assignments,
  };
  console.log(`Scraped: ${scraped_data.name} (${scraped_data.badges_count} badges)`);
  return scraped_data;
};

const main = async (): Promise<void> => {
  console.log("Scraping profiles...");
  console.log(`Total profiles: ${data.length}`);
  console.log(`Batch size: ${BATCH_SIZE}`);
  const start = Date.now();
  const new_data: ProfileData[] = [];

  // Process profiles in batches
  for (let i = 0; i < data.length; i += BATCH_SIZE) {
    const batch = data.slice(i, i + BATCH_SIZE);
    const batchNumber = Math.floor(i / BATCH_SIZE) + 1;
    const totalBatches = Math.ceil(data.length / BATCH_SIZE);

    console.log(`\nProcessing batch ${batchNumber}/${totalBatches} (${batch.length} profiles)...`);

    // Process all profiles in the batch concurrently
    const batchResults = await Promise.all(
      batch.map(profile => processProfile(profile))
    );

    new_data.push(...batchResults);
    console.log(`Batch ${batchNumber} complete!`);
  }

  const end = Date.now();
  console.log("\nScraping complete!");
  const time = ((end - start) / 60000).toFixed(2).split(".");
  console.log("Time taken:", `${time[0]}:${time[1].padEnd(2, "0")}`, "mins");
  console.log("Saving data...");
  fs.writeFileSync("src/assets/profiles_scraped_data.json", JSON.stringify(new_data, null, 2));
  console.log("Data saved!");
};

main();
