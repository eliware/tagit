const COVERAGE_RE = /All files\s*\|?\s*([\d.]+)\s*\|?\s*([\d.]+)\s*\|?\s*([\d.]+)\s*\|?\s*([\d.]+)/i;

function command(execSync, command, options = {}) {
  return execSync(command, { encoding: 'utf8', ...options });
}

export function hasStrict100x4(output) {
  const match = String(output).match(COVERAGE_RE);
  return Boolean(match && match.slice(1).every(value => Number(value) === 100));
}

export function runPreflight(execSync, fs, log, { ignore100x4 = false } = {}) {
  if (fs.existsSync('.notag')) throw new Error('.notag file detected; release is disabled.');

  const status = command(execSync, 'git status --short --untracked-files=all').trim();
  if (status) throw new Error(`Working tree is not clean:\n${status}`);

  const checks = [
    ['lint', 'npm run lint'],
    ['audit', 'npm run audit'],
  ];
  if (fs.existsSync('package.json')) {
    const packageData = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    if (packageData.scripts?.test) checks.unshift(['test', 'npm test']);
    if (!packageData.scripts?.audit) checks[checks.length - 1] = ['audit', 'npm audit --omit=dev --audit-level=moderate'];
  }

  const results = {};
  for (const [name, check] of checks) {
    log.info(`Preflight: running ${check}`);
    let output;
    try {
      output = command(execSync, check, { stdio: ['inherit', 'pipe', 'pipe'] });
    } catch (error) {
      output = `${error.stdout ?? ''}\n${error.stderr ?? ''}`;
      results[name] = { passed: false };
      throw new Error(`Preflight ${name} failed.`, { cause: error });
    }
    results[name] = { passed: true };
    if (name === 'test' && !ignore100x4 && !hasStrict100x4(output)) {
      throw new Error('Preflight test failed strict 100x4 coverage. Use an explicit operator waiver only when authorized.');
    }
  }
  return results;
}

export function waitForGitHubRun(execSync, log, {
  runId,
  timeoutMs = 300000,
  intervalMs = 10000,
  now = () => Date.now(),
  sleep = ms => new Promise(resolve => setTimeout(resolve, ms)),
} = {}) {
  if (!runId) throw new Error('A GitHub Actions run ID is required.');
  return (async () => {
    const deadline = now() + timeoutMs;
    while (now() <= deadline) {
      let data;
      try {
        data = JSON.parse(command(execSync, `gh run view ${runId} --json status,conclusion,headSha`));
      } catch (error) {
        throw new Error(`Unable to inspect GitHub Actions run ${runId}.`, { cause: error });
      }
      log.info(`GitHub Actions run ${runId}: ${data.status}${data.conclusion ? ` (${data.conclusion})` : ''}`);
      if (data.status === 'completed') {
        if (data.conclusion !== 'success') throw new Error(`GitHub Actions run ${runId} concluded ${data.conclusion}.`);
        return data;
      }
      await sleep(Math.min(intervalMs, Math.max(0, deadline - now())));
    }
    throw new Error(`GitHub Actions run ${runId} did not complete before the timeout.`);
  })();
}
