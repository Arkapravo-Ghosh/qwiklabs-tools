# Qwiklabs Tools

## Description

This repository contains tools that can be used to interact with Qwiklabs which would be useful for the facilitators of programs related to Google Cloud Platform and Qwiklabs. It now exposes an Express API for loading participants, configuring assignments, triggering the scraper, and reviewing progress.

## Usage

### Clone the repository and navigate to the directory

```bash
git clone https://github.com/Arkapravo-Ghosh/qwiklabs-tools.git
cd qwiklabs-tools
```

### Install the dependencies

```bash
npm i
```

### Configure environment variables

Create an `.env.development` (or `.env`) file with at least:

```
MONGO_URI=<your mongodb connection string>
API_KEY=<shared secret for authenticated routes>
```

The same values are required in production. `API_KEY` must be supplied through the `Authorization` header when calling protected endpoints (you can send the raw key, `Bearer <key>`, or `Api-Key <key>`).

### Setup the required csv file

Copy the csv file containing the list of participants sent by Google into `src/assets/data.csv`.

### Copy the default assignments file

```bash
cp src/assets/assignments_example.json src/assets/assignments.json
```

### Run all tools at once

```bash
npm run dev
```

This starts the Express server with hot reload. Use `npm start` when running the compiled build (or inside Docker).

### Call the API routes

All routes below are rooted at `http://localhost:8000` by default.

| Route | Method | Auth | Description |
| --- | --- | --- | --- |
| `/load` | POST | Required | Accepts a CSV payload given by Google to the Faciliator via mail and seeds/updates profiles. Use `Content-Type: text/csv` and place the file contents in the request body. |
| `/assignments` | POST | Required | Accepts JSON `{ "assignments": [], "arcade_assignments": [] }` and persists badge targets. |
| `/scrape` | GET | Required | Queues the scraper and returns queued or in-progress status with batch-based progress percentages. |
| `/progress` | GET | Optional | Returns the full progress summary as JSON. |
| `/progress/plaintext` | GET | Optional | Returns the same summary as plain text for copy/paste.

**Flow suggestion:**
1. Upload assignments with `/assignments`.
2. Load participant profiles with `/load`.
3. Trigger scraping via `/scrape` and poll the same endpoint to observe progress.
4. Share progress using `/progress` or `/progress/plaintext`.
