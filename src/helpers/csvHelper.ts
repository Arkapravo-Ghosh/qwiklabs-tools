import { Readable } from "stream";
import csv from "csv-parser";

export interface CsvProfileRow {
  "User Name": string;
  "User Email": string;
  "Google Cloud Skills Boost Profile URL": string;
  "Profile URL Status"?: string;
}

export interface ProfileSeed {
  name: string;
  email: string;
  profileUrl: string;
}

const PROFILE_STATUS_ALLOWED = new Set(["All Good", "OK", "Valid"]);

export const parseProfilesFromCsv = async (csvContent: string): Promise<ProfileSeed[]> => {
  const trimmed = csvContent.trim();
  if (trimmed.length === 0) {
    return [];
  };

  return await new Promise((resolve, reject) => {
    const rows: ProfileSeed[] = [];

    Readable.from([trimmed])
      .pipe(csv())
      .on("data", (row: CsvProfileRow) => {
        const name = row["User Name"]?.trim();
        const email = row["User Email"]?.trim();
        const profileUrl = row["Google Cloud Skills Boost Profile URL"]?.trim();
        const status = row["Profile URL Status"]?.trim();

        if (!name || !email || !profileUrl) {
          return;
        };

        if (status && !PROFILE_STATUS_ALLOWED.has(status)) {
          return;
        };

        if (name === "User Name" && email === "User Email") {
          return;
        };

        rows.push({ name, email, profileUrl });
      })
      .on("end", () => resolve(rows))
      .on("error", (error) => reject(error));
  });
};
