import { pollReleaseCi } from "../../release/ci/status.mjs";
import { pollReleaseWorkflows } from "../../release/poll/workflows.mjs";
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
  const workflows = [
    { workflowPath: ".github/workflows/ci.yaml", profile: "CI" },
    ...(checkPublish ? publicationWorkflows : []),
  ];
  const results = await pollReleaseWorkflows(poll, common, workflows);
  for (const { workflow, run } of results)
    reportReleaseLinks(log, repo, tag, run, workflow.profile);
  const [ciResult, ...publishResults] = results;
  const ciRun = ciResult.run;
  const publishRun = publishResults.at(-1)?.run;
  return { ciRunId: ciRun.databaseId, publishRunId: publishRun?.databaseId ?? null };
}
