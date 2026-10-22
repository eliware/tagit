import { execFile as defaultExecFile } from "node:child_process";
import { sleep as sleepDefault } from "../../../process/timing/sleep.mjs";
import { prepareReleaseContext } from "../prepare-release-context.mjs";
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
