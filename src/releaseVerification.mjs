export const sleepDefault = milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds));

export async function releaseCommand(execFile, executable, args, options = { encoding: 'utf8' }) {
  if (typeof execFile !== 'function') throw new TypeError('An execFile runner is required.');
  if (!Array.isArray(args)) throw new TypeError('Release command arguments must be an array.');
  return new Promise((resolve, reject) => {
    execFile(executable, args, options, (error, stdout, stderr) => {
      if (error) { error.stdout = stdout; error.stderr = stderr; reject(error); return; }
      resolve(stdout);
    });
  });
}

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

export function reportCiLinks(execSync, log, headSha, { attempts = 1, delayMs = 2000 } = {}) {
  const remote = execSync('git remote get-url origin', { encoding: 'utf8' }).trim();
  const match = remote.match(/[/:]([^/:]+\/[^/]+?)(?:\.git)?$/);
  if (!match) throw new Error(`Cannot determine GitHub repository from origin: ${remote}`);
  let runs = [];
  for (let attempt = 0; attempt < attempts && !runs.length; attempt += 1) {
    runs = json(execSync, `gh run list --repo ${match[1]} --commit ${headSha} --limit 20 --json databaseId,url,headSha`)
      .filter(run => run.headSha === headSha);
    if (!runs.length && attempt + 1 < attempts) execSync(`node -e "setTimeout(() => {}, ${delayMs})"`);
  }
  if (!runs.length) { log.info(`No CI run exists yet for ${headSha}.`); return { repo: match[1], headSha, runs: [] }; }
  runs.forEach(run => {
    log.info(`Workflow: [${run.url}](${run.url})`);
    const details = json(execSync, `gh run view ${run.databaseId} --repo ${match[1]} --json jobs`);
    (details.jobs ?? []).forEach(job => { if (job.url) log.info(`${job.name}: [${job.url}](${job.url})`); });
  });
  return { repo: match[1], headSha, runs };
}

export async function verifyRelease(execSync, fs, log, {
  version, release, initialDelayMs = 15000, pollMs = 10000, maxPolls = 30,
  npmRetries = 5, npmRetryMs = 10000, sleep = sleepDefault, linksOnly = false,
} = {}) {
  const repo = repositoryName(execSync);
  const tag = `v${version}`;
  const headSha = release.commitSha;
  let run;
  for (let poll = 0; poll < maxPolls; poll += 1) {
    const runs = json(execSync, `gh run list --repo ${repo} --limit 50 --json databaseId,status,conclusion,headSha,headBranch,url`);
    const candidate = runs.find(item => item.headSha === headSha && item.headBranch === tag);
    if (candidate) {
      const details = json(execSync, `gh run view ${candidate.databaseId} --repo ${repo} --json status,conclusion,headSha,jobs,url`);
      if (linksOnly || details.status === 'completed') { run = { ...candidate, ...details }; break; }
      log.info(`Release CI is ${details.status}; waiting...`);
    }
    await sleep(pollMs);
  }
  if (!run) throw new Error(`Release CI did not complete for ${repo}@${tag} (${headSha})`);
  if (linksOnly) {
    log.info(`Release CI discovered for ${repo}@${tag}. Run tagit release-wait to monitor it.`);
    log.info(`Workflow: [${run.url}](${run.url})`);
    (run.jobs ?? []).forEach(job => { if (job.url) log.info(`${job.name}: [${job.url}](${job.url})`); });
    return { repo, tag, headSha, runId: run.databaseId, linksOnly: true };
  }
  const successful = job => job.status === 'completed' && job.conclusion === 'success';
  const failed = run.jobs.filter(job => job.conclusion && job.conclusion !== 'success');
  if (failed.length) throw new Error(`Release CI failed: ${failed.map(job => `${job.name}: ${job.conclusion}`).join('; ')}`);
  if (!run.jobs.some(job => successful(job) && /ubuntu/i.test(job.name))) throw new Error('Release CI lacks a successful Ubuntu job.');
  if (!run.jobs.some(job => successful(job) && /windows/i.test(job.name))) throw new Error('Release CI lacks a successful Windows job.');
  const publishJobs = run.jobs.filter(job => /publish/i.test(job.name));
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
    const image = versions.find(item => item.metadata.container.tags.includes(version) || item.metadata.container.tags.includes(tag));
    if (!image) throw new Error(`GHCR does not expose ${repo}:${version}.`);
    const imageDigest = image.name?.startsWith('sha256:') ? image.name : null;
    log.info(`GHCR verified: ${repo}:${version}.`);
    if (imageDigest) log.info(`GHCR digest: ${imageDigest}`);
    return { repo, tag, headSha, ci: true, npm: Boolean(packageData?.name && !packageData.private), ghcr: true, imageDigest };
  } else log.info('GHCR verification: not applicable.');
  return { repo, tag, headSha, ci: true, npm: Boolean(packageData?.name && !packageData.private), ghcr: publishesGhcr };
}
