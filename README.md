# Qwiklabs Tools

## Description

This repository contains tools that can be used to interact with Qwiklabs which would be useful for the facilitators of programs related to Google Cloud Platform and Qwiklabs.

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

### Setup the required csv file

Copy the csv file containing the list of participants sent by Google into `src/assets/data.csv`.

### Copy the default assignments file

```bash
cp src/assets/assignments_example.json src/assets/assignments.json
```

### Run all tools at once

```bash
npm start
```

> **NOTE:** This will run all the tools in order and generate the data in the console output. If you don't want to run all the tools, you can [run the tools individually](#run-the-tools-individually).

## Run the tools individually

### Get profiles from `data.csv` file and generate the `profiles.json` file

```bash
npm run load
```

### Configure `assignments.json` file

Make an array of strings having exact badge names from Qwiklabs Website and save into a new file named `src/assets/assignments.json`. Check [assignments_example.json](src/assets/assignments_example.json) for reference.

### Scrape data from `profiles.json` and generate the `profiles_scraped_data.json` file

```bash
npm run scrape
```

> **NOTE:** This will take a long time to run as it scrapes data from the Qwiklabs website.

### Calculate the progress of users using `profiles_scraped_data.json` and log the progress in the console

```bash
npm run progress
```
