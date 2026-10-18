import { collectNotesChanges } from "./collect-changes.mjs";
import { formatNotesReport } from "./format/report.mjs";

export function buildNotesReport(execFileSync) {
  const latestTag = execFileSync("git", ["describe", "--tags", "--abbrev=0"], {
    encoding: "utf8",
  }).trim();
  return formatNotesReport(latestTag, collectNotesChanges(execFileSync, latestTag));
}
