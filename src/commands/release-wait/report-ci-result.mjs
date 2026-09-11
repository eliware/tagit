import { reportReleaseLinks } from './report-release-links.mjs';

export function reportCiResult({ log, repo, tag, headSha, run, linksOnly }) {
  if (!linksOnly) return false;
  reportReleaseLinks(log, repo, tag, run);
  return { repo, tag, headSha, runId: run.databaseId, linksOnly: true };
}
