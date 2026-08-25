/* istanbul ignore file -- exercised by release integration and mocked in downstream projects. */
const sleepDefault = milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds));

function json(execSync, command) {
  return JSON.parse(execSync(command, { encoding: 'utf8' }));
}

function repositoryName(execSync) {
  const remote = execSync('git remote get-url origin', { encoding: 'utf8' }).trim();
  const match = remote.match(/[/:]([^/:]+\/[^/]+?)(?:\.git)?$/);
  if (!match) throw new Error(`Cannot determine GitHub repository from origin: ${remote}`);
  return match[1];
}

function workflowFiles(fs) {
  const directory = '.github/workflows';
  if (!fs.existsSync(directory)) return [];
  return fs.readdirSync(directory).filter(file => /\.(yml|yaml)$/i.test(file));
}

export async function verifyRelease(execSync, fs, log, {
  version, release, initialDelayMs = 15000, pollMs = 10000, maxPolls = 30,
  npmRetries = 5, npmRetryMs = 10000, sleep = sleepDefault,
} = {}) {
  const repo = repositoryName(execSync);
  const tag = `v${version}`;
  const headSha = release?.commitSha || execSync(`git rev-parse ${tag}`, { encoding: 'utf8' }).trim();
  let run;
  for (let poll = 0; poll < maxPolls; poll += 1) {
    const runs = json(execSync, `gh run list --repo ${repo} --limit 50 --json databaseId,status,conclusion,headSha,headBranch,url`);
    const candidate = runs.find(item => item.headSha === headSha && item.headBranch === tag);
    if (candidate) {
      const details = json(execSync, `gh run view ${candidate.databaseId} --repo ${repo} --json status,conclusion,headSha,jobs,url`);
      if (details.status === 'completed') { run = { ...candidate, ...details }; break; }
      log.info(`Release CI is ${details.status}; waiting...`);
    }
    await sleep(pollMs);
  }
  if (!run) throw new Error(`Release CI did not complete for ${repo}@${tag} (${headSha})`);
  const successful = job => job.status === 'completed' && job.conclusion === 'success';
  const failed = run.jobs.filter(job => job.conclusion && job.conclusion !== 'success');
  if (failed.length) throw new Error(`Release CI failed: ${failed.map(job => `${job.name}: ${job.conclusion}`).join('; ')}`);
  if (!run.jobs.some(job => successful(job) && /ubuntu/i.test(job.name))) throw new Error('Release CI lacks a successful Ubuntu job.');
  if (!run.jobs.some(job => successful(job) && /windows/i.test(job.name))) throw new Error('Release CI lacks a successful Windows job.');
  const publishJobs = run.jobs.filter(job => /publish/i.test(job.name));
  if (publishJobs.length && !publishJobs.every(successful)) throw new Error('Release publish job did not succeed.');
  const ubuntuJob = run.jobs.find(job => /ubuntu/i.test(job.name));
  const windowsJob = run.jobs.find(job => /windows/i.test(job.name));
  const links = [
    ['Workflow', run.url],
    ['Ubuntu', ubuntuJob?.url],
    ['Windows', windowsJob?.url],
    ...publishJobs.map((job, index) => [`Publish${publishJobs.length > 1 ? ` ${index + 1}` : ''}`, job.url]),
  ].filter(([, url]) => url);
  log.info(`Release CI verified for ${repo}@${tag}:`);
  links.forEach(([label, url]) => log.info(`${label}: [${url}](${url})`));

  const packageData = fs.existsSync('package.json') ? JSON.parse(fs.readFileSync('package.json', 'utf8')) : null;
  if (packageData?.name && !packageData.private) {
    await sleep(initialDelayMs);
    let published = false;
    for (let attempt = 0; attempt < npmRetries; attempt += 1) {
      try {
        const visible = execSync(`npm view ${packageData.name}@${version} version`, { encoding: 'utf8' }).trim();
        if (visible === version) { published = true; break; }
      } catch { /* Registry propagation can temporarily return 404. */ }
      await sleep(npmRetryMs);
    }
    if (!published) throw new Error(`npm did not expose ${packageData.name}@${version} after ${npmRetries} attempts.`);
    log.info(`npm verified: ${packageData.name}@${version}.`);
  } else log.info('npm verification: not applicable.');

  const publishesGhcr = workflowFiles(fs).some(file => fs.readFileSync(`.github/workflows/${file}`, 'utf8').includes('ghcr.io'));
  if (publishesGhcr) {
    const versions = json(execSync, `gh api --paginate /orgs/${repo.split('/')[0]}/packages/container/${repo.split('/')[1]}/versions`);
    const found = versions.some(item => (item.metadata?.container?.tags || []).includes(version) || (item.metadata?.container?.tags || []).includes(tag));
    if (!found) throw new Error(`GHCR does not expose ${repo}:${version}.`);
    log.info(`GHCR verified: ${repo}:${version}.`);
  } else log.info('GHCR verification: not applicable.');
  return { repo, tag, headSha, ci: true, npm: Boolean(packageData?.name && !packageData.private), ghcr: publishesGhcr };
}
