const COVERAGE_RE = /All files\s*\|?\s*([\d.]+)\s*\|?\s*([\d.]+)\s*\|?\s*([\d.]+)\s*\|?\s*([\d.]+)/i;

function command(execSync, command, options = {}) {
  return execSync(command, { encoding: 'utf8', ...options });
}

export function hasStrict100x4(output) {
  const match = String(output).match(COVERAGE_RE);
  return Boolean(match && match.slice(1).every(value => Number(value) === 100));
}

function readCiRun(execSync, runId) {
  return JSON.parse(command(execSync, `gh run view ${runId} --json status,conclusion,headSha,jobs`));
}

export function verifyLatestCi(execSync, log, {
  headSha,
  repository = null,
} = {}) {
  if (!headSha) throw new Error('A commit SHA is required for CI verification.');
  const repoArg = repository ? ` --repo ${repository}` : '';
  let runs;
  try {
    runs = JSON.parse(command(execSync, `gh run list --commit ${headSha}${repoArg} --limit 20 --json databaseId,status,conclusion,headSha`));
  } catch (error) {
    throw new Error(`Unable to inspect GitHub Actions runs for ${headSha}.`, { cause: error });
  }
  const candidates = runs.filter(run => run.headSha === headSha && run.status === 'completed' && run.conclusion === 'success');
  if (!candidates.length) throw new Error(`No successful GitHub Actions run exists for ${headSha}.`);
  for (const run of candidates) {
    const data = readCiRun(execSync, run.databaseId);
    const jobs = data.jobs ?? [];
    const successful = job => job.status === 'completed' && job.conclusion === 'success';
    const ubuntu = jobs.some(job => successful(job) && /ubuntu/i.test(job.name));
    const windows = jobs.some(job => successful(job) && /windows/i.test(job.name));
    if (data.headSha === headSha && ubuntu && windows) {
      log.info(`GitHub Actions CI verified for ${headSha}: Ubuntu and Windows passed.`);
      return { runId: run.databaseId, headSha, ubuntu: true, windows: true };
    }
  }
  throw new Error(`Successful GitHub Actions run for ${headSha} lacks passing Ubuntu and Windows jobs.`);
}

export function runPreflight(execSync, fs, log, { ignore100x4 = false, verifyCi = false } = {}) {
  if (fs.existsSync('.notag')) throw new Error('.notag file detected; release is disabled.');

  const status = command(execSync, 'git status --short --untracked-files=all').trim();
  if (status) throw new Error(`Working tree is not clean:\n${status}`);

  const checks = [
    ['lint', 'npm run lint'],
    ['audit', 'npm audit --omit=dev --audit-level=moderate'],
    ['pack', 'npm pack --dry-run'],
  ];
  if (fs.existsSync('package.json')) {
    const packageData = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    if (packageData.scripts?.test) checks.unshift(['test', 'npm test']);
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
  if (verifyCi) {
    const headSha = command(execSync, 'git rev-parse HEAD').trim();
    results.ci = verifyLatestCi(execSync, log, { headSha });
  }
  return results;
}
