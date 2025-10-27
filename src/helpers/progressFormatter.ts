import { ProgressSummary } from "../services/progressService";

const formatList = (items: string[]): string => {
  return items.length > 0 ? items.join(", ") : "None";
};

const formatDistribution = (distribution: Record<number, number>): string[] => {
  const lines: string[] = [];
  const orderedCounts = Object.keys(distribution)
    .map((key) => Number(key))
    .sort((a, b) => a - b);

  orderedCounts.forEach((count) => {
    lines.push(`${count} badge(s): ${distribution[count]}`);
  });

  if (lines.length === 0) {
    lines.push("No distribution data available");
  };

  return lines;
};

interface FormatNamedListOptions {
  numbered?: boolean;
}

const formatNamedList = (label: string, data: Array<{ name: string; email: string }>, options: FormatNamedListOptions = {}): string[] => {
  const lines: string[] = [label];
  if (data.length === 0) {
    lines.push("  None");
    return lines;
  };
  data.forEach((item, index) => {
    if (options.numbered) {
      lines.push(`  ${index + 1}. ${item.name} <${item.email}>`);
    } else {
      lines.push(`  - ${item.name} <${item.email}>`);
    };
  });
  return lines;
};

const formatRemainingOneBadge = (data: Array<{ name: string; email: string; pendingAssignment: string | null }>): string[] => {
  const lines: string[] = ["Remaining With One Badge:"];
  if (data.length === 0) {
    lines.push("  None");
    return lines;
  };
  data.forEach((item) => {
    const pending = item.pendingAssignment ?? "Unknown assignment";
    lines.push(`  - ${item.name} <${item.email}> pending "${pending}"`);
  });
  return lines;
};

const formatAssignments = (assignments: Array<{ name: string; completedCount: number }>): string[] => {
  const lines: string[] = ["Assignment Completion Counts:"];
  if (assignments.length === 0) {
    lines.push("  None configured");
    return lines;
  };
  assignments.forEach((assignment) => {
    lines.push(`  - ${assignment.name}: ${assignment.completedCount}`);
  });
  return lines;
};

export const formatProgressSummary = (summary: ProgressSummary): string => {
  const lines: string[] = [];

  lines.push("Program Progress Report");
  lines.push(`Generated At: ${new Date().toISOString()}`);
  lines.push(`Last Scraped At: ${summary.lastScrapedAt ? summary.lastScrapedAt.toISOString() : "N/A"}`);
  lines.push("");

  lines.push("Totals:");
  lines.push(`  Profiles: ${summary.totals.profiles}`);
  lines.push(`  Completed All: ${summary.totals.completedAll}`);
  lines.push(`  Completed Some: ${summary.totals.completedSome}`);
  lines.push(`  Completed None: ${summary.totals.completedNone}`);
  lines.push(`  Arcade Badge: ${summary.totals.arcadeBadge}`);
  lines.push("");

  lines.push("Badge Distribution:");
  formatDistribution(summary.distribution).forEach((line) => {
    lines.push(`  ${line}`);
  });
  lines.push("");

  formatAssignments(summary.assignments).forEach((line) => lines.push(line));
  lines.push("");

  formatNamedList("Completed All Badges:", summary.completedAll, { numbered: true }).forEach((line) => lines.push(line));
  lines.push("");

  formatNamedList("Completed All Without Arcade Badge:", summary.completedAllWithoutArcade).forEach((line) => lines.push(line));
  lines.push("");

  formatRemainingOneBadge(summary.remainingOneBadge).forEach((line) => lines.push(line));
  lines.push("");

  lines.push(`Assignments Configured: ${formatList(summary.assignmentsConfigured)}`);

  return lines.join("\n");
};
