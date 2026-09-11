import { execFile as defaultExecFile } from 'node:child_process';
import { sleep as sleepDefault } from '../../process/timing/sleep.mjs';
import { pollReleaseCi } from './release-ci-status.mjs';
import { verifyReleasePublication } from './release-publication-status.mjs';
import { validateReleaseInput } from './validate-release-input.mjs';
import { resolveReleaseContext } from './resolve-release-context.mjs';
import { reportCiResult } from './report-ci-result.mjs';
export { npmExecutable } from '../../process/commands/npm-executable.mjs';
export { waitSync } from '../../process/timing/wait-sync.mjs';
export { sleep as sleepDefault } from '../../process/timing/sleep.mjs';
export { execFileCommand as releaseCommand } from '../../process/async/exec-file.mjs';
export { reportCiLinks } from '../../github/links/report-ci-links.mjs';
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
  validateReleaseInput(version, release, maxPolls, npmRetries, pollMs, npmRetryMs);
  const { repo, tag, headSha } = resolveReleaseContext(execFileSync, version, release);
  const run = await pollReleaseCi({ execFile, repo, headSha, tag, pollMs, maxPolls, sleep, linksOnly, log });
  const reported = reportCiResult({ log, repo, tag, headSha, run, linksOnly });
  if (reported) return reported;
  return verifyReleasePublication({
    fs,
    execFile,
    log,
    repo,
    tag,
    headSha,
    version,
    run,
    release,
    maxPolls,
    npmRetries,
    pollMs,
    npmRetryMs,
    sleep,
  });
}
