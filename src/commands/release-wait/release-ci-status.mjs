import { selectReleaseRun } from '../../github/runs/release-run-selection.mjs';
import { readGithubJson } from '../../github/cli/read-json.mjs';

export async function pollReleaseCi({ execFile, repo, headSha, tag, pollMs, maxPolls, sleep, linksOnly, log }) {
  let run;
  for (let poll = 0; poll < maxPolls; poll += 1) {
    let runs;
    try { runs = await readGithubJson(execFile, 'gh', ['run', 'list', '--repo', repo, '--limit', '20', '--json', 'databaseId,createdAt,status,conclusion,headSha,headBranch,url']); }
    catch (error) { if (poll + 1 >= maxPolls) throw new Error(`Release CI inspection failed after ${maxPolls} attempts: ${error.message}`); await sleep(pollMs); continue; }
    const candidate = selectReleaseRun(runs, headSha, tag);
    if (candidate) {
      if (candidate.status === 'completed' && candidate.conclusion !== 'success') throw new Error(`Release CI failed: ${String(candidate.conclusion)}.`);
      const details = await readGithubJson(execFile, 'gh', ['run', 'view', String(candidate.databaseId), '--repo', repo, '--json', 'status,conclusion,headSha,jobs,url']);
      if (details.headSha !== headSha) throw new Error(`Release CI details have commit ${details.headSha ?? 'unknown'}, expected ${headSha}.`);
      if (details.status === 'completed' && details.conclusion !== 'success') throw new Error(`Release CI failed: ${String(details.conclusion)}.`);
      if (linksOnly || details.status === 'completed') { run = { ...candidate, ...details }; break; }
      log.info(`Release CI is ${details.status}; waiting...`);
    }
    if (!run && poll + 1 < maxPolls) await sleep(pollMs);
  }
  if (!run) throw new Error(`Release CI did not complete for ${repo}@${tag} (${headSha})`);
  return run;
}
