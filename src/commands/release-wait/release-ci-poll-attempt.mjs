import { readReleaseCiCandidate } from './read-release-ci-candidate.mjs';
import { readReleaseCiDetails } from './read-release-ci-details.mjs';
import { validateReleaseRunDetails } from './validate-release-run-details.mjs';
import { formatReleaseCiFailure } from './format-release-ci-failure.mjs';
import { mergeReleaseRun } from './merge-release-run.mjs';

export async function runReleaseCiPollAttempt({ execFile, repo, headSha, tag, linksOnly, log }) {
  const candidate = await readReleaseCiCandidate(execFile, repo, headSha, tag);
  if (!candidate) return null;
  const details = await readReleaseCiDetails(execFile, repo, candidate.databaseId);
  validateReleaseRunDetails(details, candidate, headSha);
  const failure = formatReleaseCiFailure(details);
  if (failure) throw new Error(failure);
  if (linksOnly || details.status === 'completed') return mergeReleaseRun(candidate, details);
  log.info(`Release CI is ${details.status}; waiting...`);
  return { pending: true };
}
