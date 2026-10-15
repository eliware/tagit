import { pollReleaseCi } from "./release-ci-status.mjs";
import { reportReleaseLinks } from "./report-release-links.mjs";

export async function reportReleaseStart({
  execFile,
  repo,
  headSha,
  tag,
  pollMs,
  maxPolls,
  sleep,
  log,
  checkPublish,
  poll = pollReleaseCi,
}) {
  const common = { execFile, repo, headSha, tag, pollMs, maxPolls, sleep, linksOnly: true, log };
  const ciRun = await poll({
    ...common,
    workflowPath: ".github/workflows/ci.yaml",
    workflowLabel: "CI",
  });
  reportReleaseLinks(log, repo, tag, ciRun, "CI");
  let publishRun = null;
  if (checkPublish) {
    publishRun = await poll({
      ...common,
      workflowPath: ".github/workflows/publish.yaml",
      workflowLabel: "publish",
    });
    reportReleaseLinks(log, repo, tag, publishRun, "publish");
  }
  return { ciRunId: ciRun.databaseId, publishRunId: publishRun?.databaseId ?? null };
}
