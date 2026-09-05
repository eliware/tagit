import { selectReleaseRun } from '../../github/runs/release-run-selection.mjs';
import { readGithubJson } from '../../github/cli/read-json.mjs';
import { validateJobRecords } from '../../validation/ci/validate-job-records.mjs';

export async function pollReleaseCi({ execFile, repo, headSha, tag, pollMs, maxPolls, sleep, linksOnly, log }) {
  let run;
  for (let poll = 0; poll < maxPolls; poll += 1) {
    let runs;
    try { runs = await readGithubJson(execFile, 'gh', ['run', 'list', '--repo', repo, '--limit', '20', '--json', 'databaseId,createdAt,status,conclusion,headSha,headBranch,url']); }
    catch (error) {
      if (error instanceof SyntaxError) throw new Error(`Release CI returned malformed list JSON: ${error.message}`);
      if (poll + 1 >= maxPolls) throw new Error(`Release CI inspection failed after ${maxPolls} attempts: ${error.message}`);
      await sleep(pollMs); continue;
    }
    const candidate = selectReleaseRun(runs, headSha, tag);
    if (candidate) {
      const details = await readGithubJson(execFile, 'gh', ['run', 'view', String(candidate.databaseId), '--repo', repo, '--json', 'status,conclusion,headSha,jobs,url']);
      if (!details || typeof details.status !== 'string' || typeof details.conclusion !== 'string' || typeof details.headSha !== 'string' || !Array.isArray(details.jobs)) throw new Error(`Release CI returned malformed details for run ${candidate.databaseId}.`);
      validateJobRecords(details.jobs, candidate.databaseId);
      if (details.headSha !== headSha) throw new Error(`Release CI details have commit ${details.headSha}, expected ${headSha}.`);
      if (candidate.status === 'completed' && candidate.conclusion !== 'success') {
        const jobs = details.jobs.map(job => `${job.name} [${job.status}/${job.conclusion}]`).join(', ');
        throw new Error(`Release CI failed: ${String(candidate.conclusion)}. Jobs: ${jobs || 'none reported'}.`);
      }
      if (details.status === 'completed' && details.conclusion !== 'success') {
        const jobs = details.jobs.map(job => `${job.name} [${job.status}/${job.conclusion}]`).join(', ');
        throw new Error(`Release CI failed: ${String(details.conclusion)}. Jobs: ${jobs || 'none reported'}.`);
      }
      if (linksOnly) return { ...candidate, ...details, databaseId: candidate.databaseId, headSha: details.headSha, headBranch: candidate.headBranch };
      if (details.status === 'completed') { run = { ...candidate, ...details, databaseId: candidate.databaseId, headSha: details.headSha, headBranch: candidate.headBranch }; break; }
      log.info(`Release CI is ${details.status}; waiting...`);
    }
    if (!run && poll + 1 < maxPolls) await sleep(pollMs);
  }
  if (!run) throw new Error(`Release CI did not complete for ${repo}@${tag} (${headSha})`);
  return run;
}
