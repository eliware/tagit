import { pollReleaseCi } from "../../release/ci/status.mjs";
import { reportReleaseLinks } from "./links.mjs";

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
  publicationWorkflows = [],
  poll = pollReleaseCi,
}) {
  const common = { execFile, repo, headSha, tag, pollMs, maxPolls, sleep, linksOnly: true, log };
  const ciRun = await poll({
    ...common,
    workflowPath: ".github/workflows/ci.yaml",
    workflowLabel: "CI",
  });
  reportReleaseLinks(log, repo, tag, ciRun, "CI");
  const publishRuns = [];
  if (checkPublish) {
    for (const workflow of publicationWorkflows) {
      const run = await poll({
        ...common,
        workflowPath: workflow.workflowPath,
        workflowLabel: workflow.profile,
      });
      reportReleaseLinks(log, repo, tag, run, workflow.profile);
      publishRuns.push(run);
    }
  }
  return { ciRunId: ciRun.databaseId, publishRunId: publishRuns.at(-1)?.databaseId ?? null };
}
