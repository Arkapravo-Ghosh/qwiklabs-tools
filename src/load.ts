import fs from "fs/promises";
import csv from "csv-parser";

interface ProfileData {
  "User Name": string;
  "User Email": string;
  "Google Cloud Skills Boost Profile URL": string;
};

const readCSV = async (filePath: string): Promise<ProfileData[]> => {
  const data: ProfileData[] = [];
  const fileStream = await fs.open(filePath, "r");

  return new Promise((resolve, reject) => {
    fileStream.createReadStream()
      .pipe(csv())
      .on("data", (row: Record<string, string>) => {
        if (row["User Name"] !== "User Name" && row["Profile URL Status"] === "All Good") {
          data.push({
            "User Name": row["User Name"],
            "User Email": row["User Email"],
            "Google Cloud Skills Boost Profile URL": row["Google Cloud Skills Boost Profile URL"]
          });
        };
      })
      .on("end", () => resolve(data))
      .on("error", (error) => reject(error));
  });
};

const writeJSON = async (filePath: string, data: ProfileData[]): Promise<void> => {
  const jsonData = JSON.stringify(data, null, 2);
  await fs.writeFile(filePath, jsonData, "utf8");
};

const main = async () => {
  const inputCSV = "src/assets/data.csv";
  const outputJSON = "src/assets/profiles.json";

  try {
    const allGoodProfiles = await readCSV(inputCSV);
    await writeJSON(outputJSON, allGoodProfiles);
    console.log(`Profiles saved to ${outputJSON}`);
  } catch (error) {
    console.error(`Error processing files: ${error}`);
  };
};

main();
