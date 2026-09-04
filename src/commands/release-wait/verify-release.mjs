import { execFile as defaultExecFile } from 'node:child_process';
import { sleep as sleepDefault } from '../../process/timing/sleep.mjs';
import { readRepositoryName } from '../../repository/repository-name/read-repository-name.mjs';
import { validatePollBudget } from '../../process/timing/poll-budget.mjs';
import { releaseTag } from '../../policy/tag-policy.mjs';
import { pollReleaseCi } from './release-ci-status.mjs';
import { verifyReleasePublication } from './release-publication-status.mjs';
export { npmExecutable } from '../../process/commands/npm-executable.mjs';
export { waitSync } from '../../process/timing/wait-sync.mjs';
export { sleep as sleepDefault } from '../../process/timing/sleep.mjs';
export { execFileCommand as releaseCommand } from '../../process/async/exec-file.mjs';
export { reportCiLinks } from '../../github/links/report-ci-links.mjs';
export async function verifyRelease(execFileSync, fs, log, {
  version, release, pollMs = 10000, maxPolls = 30,
  npmRetries = maxPolls, npmRetryMs = pollMs, sleep = sleepDefault, linksOnly = false, execFile = defaultExecFile,
} = {}) {
  if (!/^\d+\.\d+\.\d+$/.test(version ?? '') || !/^[0-9a-f]{3,64}$/i.test(release?.commitSha ?? '')) {
    throw new Error('Release version and commit SHA are required and must be valid.');
  }
  validatePollBudget(maxPolls, npmRetries, pollMs, npmRetryMs);
  const repo = readRepositoryName(execFileSync);
  const tag = releaseTag(version);
  const headSha = release.commitSha;
  const run = await pollReleaseCi({ execFile, repo, headSha, tag, pollMs, maxPolls, sleep, linksOnly, log });
  if (linksOnly) {
    log.info(`Release CI discovered for ${repo}@${tag}. Run tagit release-wait to monitor it.`);
    log.info(`Workflow: [${run.url}](${run.url})`);
    (run.jobs ?? []).forEach(job => { if (job.url) log.info(`${job.name}: [${job.url}](${job.url})`); });
    return { repo, tag, headSha, runId: run.databaseId, linksOnly: true };
  }
  return verifyReleasePublication({ fs, execFile, log, repo, tag, headSha, version, run, release, maxPolls, npmRetries, pollMs, npmRetryMs, sleep });
}
