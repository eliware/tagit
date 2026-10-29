import { pollReleaseCi } from "../../release/ci/status.mjs";
import { pollReleaseWorkflows } from "../../release/poll/workflows.mjs";
import { buildReleaseCiPollOptions } from "../../verify/release/ci/options.mjs";
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
  poll = pollReleaseCi,
}) {
  const common = buildReleaseCiPollOptions({
    execFile,
    repo,
    headSha,
    tag,
    pollMs,
    maxPolls,
    sleep,
    linksOnly: true,
    log,
  });
  const [{ run: ciRun }] = await pollReleaseWorkflows(poll, common, [
    { workflowPath: ".github/workflows/ci.yaml", profile: "CI" },
  ]);
  reportReleaseLinks(log, repo, tag, ciRun, "CI");
  return { ciRunId: ciRun.databaseId, publishRunId: null };
}
