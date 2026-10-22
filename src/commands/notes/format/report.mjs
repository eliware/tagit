import { formatNotesActions } from "./actions.mjs";

export function formatNotesReport(tag, changes) {
  const { commits, files, excerpt } = changes;
  return [
    "tagit notes report",
    `Range: ${tag}..current commit`,
    "",
    "COMMITS",
    commits || "(none)",
    "",
    "CHANGED FILES",
    files || "(none)",
    "",
    "DIFF",
    excerpt || "(no source diff)",
    "",
    ...formatNotesActions(),
  ].join("\n");
}
