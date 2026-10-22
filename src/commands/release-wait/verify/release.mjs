import { execFile as defaultExecFile } from "node:child_process";
import { sleep as sleepDefault } from "../../../process/timing/sleep.mjs";
import { prepareReleaseContext } from "../prepare-release-context.mjs";
import { reportReleaseStart } from "../report/release/start.mjs";
import { verifyReleaseCompletion } from "./release/completion.mjs";
export async function verifyRelease(
  execFileSync,
  fs,
  log,
  {
    version,
    release,
    pollMs = 10000,
    maxPolls = 30,
    npmRetries = maxPolls,
    npmRetryMs = pollMs,
    sleep = sleepDefault,
    linksOnly = false,
    execFile = defaultExecFile,
  } = {},
) {
  const { repo, tag, headSha, runnerLabelsByJobName, publication } = prepareReleaseContext(
    execFileSync,
    fs,
    {
      version,
      release,
      maxPolls,
      npmRetries,
      pollMs,
      npmRetryMs,
    },
  );
  const publicationWorkflows = publication.workflows;
  const checkPublish = publicationWorkflows.length > 0;
  if (linksOnly) {
    const { ciRunId, publishRunId } = await reportReleaseStart({
      execFile,
      repo,
      headSha,
      tag,
      pollMs,
      maxPolls,
      sleep,
      log,
      checkPublish,
      publicationWorkflows,
    });
    return {
      repo,
      tag,
      headSha,
      ciRunId,
      publishRunId,
      linksOnly: true,
    };
  }
  return verifyReleaseCompletion({
    fs,
    runnerLabelsByJobName,
    execFile,
    log,
    repo,
    tag,
    headSha,
    version,
    release,
    checkPublish,
    publicationWorkflows,
    pollMs,
    maxPolls,
    npmRetries,
    npmRetryMs,
    sleep,
  });
}
