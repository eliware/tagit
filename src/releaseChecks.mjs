import path from 'node:path';

const COVERAGE_RE = /All files\s*\|?\s*([\d.]+)\s*\|?\s*([\d.]+)\s*\|?\s*([\d.]+)\s*\|?\s*([\d.]+)/i;
const CHECK_TIMEOUT_MS = 120000;
const OUTPUT_LIMIT = 4000;

function outputText(output) {
  const text = String(output).trim();
  if (!text) return '\nOutput: (no output captured)';
  const excerpt = text.length > OUTPUT_LIMIT ? `${text.slice(0, OUTPUT_LIMIT)}\n...[output truncated]` : text;
  return `\nOutput excerpt:\n${excerpt}`;
}

export function resolveExecutable(executable, platform = process.platform) {
  return platform === 'win32' && executable === 'npm' ? 'npm.cmd' : executable;
}

export function processCommand(executable, args, platform = process.platform, nodePath = process.execPath) {
  if (platform === 'win32' && executable === 'npm') {
    return [nodePath, [path.win32.join(path.win32.dirname(nodePath), 'node_modules', 'npm', 'bin', 'npm-cli.js'), ...args]];
  }
  return [resolveExecutable(executable), args];
}

function failureMessage(name, error, output) {
  const timedOut = error?.code === 'ETIMEDOUT' || error?.signal === 'SIGTERM';
  if (timedOut) return `BLOCKED: ${name} exceeded the ${CHECK_TIMEOUT_MS / 1000}-second limit and may be hanging. Action: inspect for unset timers, open handles, or waiting network/process operations, then rerun tagit preflight.`;
  return `BLOCKED: ${name} failed. Action: fix the reported issue, rerun it successfully, then rerun tagit preflight.${outputText(output)}`;
}

export function hasStrict100x4(output) {
  const match = String(output).match(COVERAGE_RE);
  return Boolean(match && match.slice(1).every(value => Number(value) === 100));
}

function readCiRun(execFileSync, runId) {
  const output = execFileSync('gh', ['run', 'view', String(runId), '--json', 'status,conclusion,headSha,jobs'], { encoding: 'utf8' });
  return JSON.parse(output);
}

export function verifyLatestCi(execFileSync, log, {
  headSha,
  repository = null,
  waitForCompletion = true,
} = {}) {
  if (!headSha) throw new Error('A commit SHA is required for CI verification.');
  const repoArg = repository ? ['--repo', repository] : [];
  const gh = (args, options = {}) => execFileSync('gh', args, { encoding: 'utf8', ...options });
  let runs;
  try {
    runs = JSON.parse(gh(['run', 'list', '--commit', headSha, ...repoArg, '--limit', '20', '--json', 'databaseId,status,conclusion,headSha,url']));
  } catch (error) {
    throw new Error(`Unable to inspect GitHub Actions runs for ${headSha}.`, { cause: error });
  }
  const matchingRuns = runs.filter(run => run.headSha === headSha).sort((a, b) => Number(b.databaseId) - Number(a.databaseId));
  const pending = matchingRuns.find(run => run.status !== 'completed');
  if (pending && waitForCompletion) {
    if (pending.url) log.info(`CI in progress; waiting for completion: [workflow run ${pending.databaseId}](${pending.url})`);
    try {
      gh(['run', 'watch', String(pending.databaseId), ...repoArg, '--exit-status', '--interval', '3'], { timeout: 600000 });
    } catch {
      // Re-read the completed run below so the final error includes its conclusion.
    }
    return verifyLatestCi(execFileSync, log, { headSha, repository, waitForCompletion: false });
  }
  const candidates = matchingRuns.filter(run => run.status === 'completed' && run.conclusion === 'success');
  if (!candidates.length) {
    const matching = runs.filter(run => run.headSha === headSha);
    const details = matching.map(run => `${run.url ? `[run ${run.databaseId}](${run.url})` : `run ${run.databaseId}`} [${run.status}/${run.conclusion}]`).join(', ');
    throw new Error(`No successful GitHub Actions run exists for ${headSha}. Observed: ${details}`);
  }
  for (const run of candidates) {
    const data = readCiRun(execFileSync, run.databaseId);
    const jobs = data.jobs ?? [];
    const successful = job => job.status === 'completed' && job.conclusion === 'success';
    const ubuntu = jobs.some(job => successful(job) && /ubuntu/i.test(job.name));
    const windows = jobs.some(job => successful(job) && /windows/i.test(job.name));
    if (data.headSha === headSha && ubuntu && windows) {
      log.info(`GitHub Actions CI verified for ${headSha}: Ubuntu and Windows passed.`);
      return { runId: run.databaseId, headSha, ubuntu: true, windows: true };
    }
  }
  const jobSummary = candidates.map(run => {
    const data = readCiRun(execFileSync, run.databaseId);
    const jobs = Array.isArray(data.jobs) ? data.jobs : [];
    return `${run.url ? `[run ${run.databaseId}](${run.url})` : `run ${run.databaseId}`}: ${jobs.map(job => `${job.url ? `[${job.name}](${job.url})` : job.name} [${job.status}/${job.conclusion}]`).join(', ')}`;
  }).join('; ');
  throw new Error(`Successful GitHub Actions run for ${headSha} lacks passing Ubuntu and Windows jobs. Jobs: ${jobSummary}`);
}

function validateRepository(execFileSync, fs, failures) {
  try {
    const branch = execFileSync('git', ['branch', '--show-current'], { encoding: 'utf8' }).trim();
    if (branch !== 'main') failures.push(`BLOCKED: release validation must run on main (current branch: ${branch || 'detached'}). Action: check out main and rerun tagit preflight.`);
  } catch (error) { failures.push(failureMessage('branch validation', error)); }
  for (const file of ['package.json', 'README.md', 'RELEASE_NOTES.md', '.github/workflows/nodejs.yml']) {
    if (!fs.existsSync(file)) failures.push(`BLOCKED: required repository file is missing: ${file}. Action: restore it and rerun tagit preflight.`);
  }
  try {
    const packageData = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    for (const field of ['name', 'version', 'description', 'license']) {
      if (!packageData[field]) failures.push(`BLOCKED: package.json is missing metadata: ${field}. Action: correct package metadata and rerun tagit preflight.`);
    }
  } catch (error) { failures.push(failureMessage('package metadata validation', error)); }
  const secretPattern = /(^|[\\/])(?:\.env(?:$|\.(?!example$))|id_rsa(?:\.|$)|credentials(?:\.|[\\/]|$)|secrets?(?:\.|[\\/]|$))/i;
  try {
    const secrets = execFileSync('git', ['ls-files'], { encoding: 'utf8' }).split(/\r?\n/).filter(file => secretPattern.test(file));
    if (secrets.length) failures.push(`BLOCKED: tracked secret-looking files were found:\n${secrets.join('\n')}\nAction: remove secrets from Git and rerun tagit preflight.`);
  } catch (error) { failures.push(failureMessage('tracked-file validation', error)); }
}

export function runPreflight(execFileSync, fs, log, { ignore100x4 = false, verifyCi = false, strictRepository = false } = {}) {
  const status = execFileSync('git', ['status', '--short', '--untracked-files=all'], { encoding: 'utf8' }).trim();
  const failures = [];
  if (strictRepository) validateRepository(execFileSync, fs, failures);
  if (status) failures.push(`BLOCKED: uncommitted changes are present:\n${status}\nAction: commit and push these changes, wait for CI to pass on the new commit, then rerun tagit preflight.`);

  const checks = [
    ['lint', ['npm', ['run', 'lint']]],
    ['audit', ['npm', ['audit', '--omit=dev', '--audit-level=moderate']]],
    ['pack', ['npm', ['pack', '--dry-run']]],
  ];
  if (fs.existsSync('package.json')) {
    const packageData = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    if (packageData.scripts?.test) checks.unshift(['test', ['npm', ['test']]]);
  }

  const results = {};
  for (const [name, [executable, args]] of checks) {
    let output;
    try {
      const options = { stdio: 'pipe', timeout: CHECK_TIMEOUT_MS };
      if (name === 'audit') {
        options.env = { ...process.env, npm_config_ignore_scripts: 'true' };
        delete options.env.npm_config_allow_scripts;
      }
      const [command, commandArgs] = processCommand(executable, args);
      output = execFileSync(command, commandArgs, options);
    } catch (error) {
      output = `${error.stdout ?? ''}\n${error.stderr ?? ''}`;
      results[name] = { passed: false };
      failures.push(failureMessage(name, error, `${error.stdout ?? ''}\n${error.stderr ?? ''}`));
      continue;
    }
    results[name] = { passed: true };
    if (name === 'test' && !ignore100x4 && !hasStrict100x4(output)) {
      results[name] = { passed: false };
      failures.push(`BLOCKED: npm test did not report 100×4 coverage. Action: add tests for the files and lines shown below, rerun npm test, then rerun tagit preflight.${outputText(output)}`);
    }
  }
  if (verifyCi) {
    if (status) {
      results.ci = { passed: false, blocked: true };
    } else try {
      const headSha = execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
      results.ci = verifyLatestCi(execFileSync, log, { headSha });
    } catch (error) {
      results.ci = { passed: false };
      failures.push(`BLOCKED: GitHub CI verification failed: ${error.message}\nAction: push the current commit, wait for successful Ubuntu and Windows CI, then rerun tagit preflight.`);
    }
  }
  if (failures.length) throw new Error(`Preflight found ${failures.length} issue(s):\n\n${failures.join('\n\n')}`);
  return results;
}
