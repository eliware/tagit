import { execFile as defaultExecFile } from 'node:child_process';

export const sleepDefault = milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds));

export function waitSync(milliseconds) {
  if (milliseconds <= 0) return;
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, milliseconds);
}
export function npmExecutable(platform = process.platform) { return platform === 'win32' ? 'npm.cmd' : 'npm'; }

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

async function jsonAsync(execFile, executable, args) {
  return JSON.parse(await releaseCommand(execFile, executable, args));
}

function repositoryName(execFileSync) {
  const remote = execFileSync('git', ['remote', 'get-url', 'origin'], { encoding: 'utf8' }).trim();
  const match = remote.match(/[/:]([^/:]+\/[^/]+?)(?:\.git)?$/);
  if (!match) throw new Error(`Cannot determine GitHub repository from origin: ${remote}`);
  return match[1];
}

function workflowFiles(fs) {
  const directory = '.github/workflows';
  if (!fs.existsSync(directory)) return [];
  return fs.readdirSync(directory).filter(file => /\.(yml|yaml)$/i.test(file));
}

export function reportCiLinks(execFileSync, log, headSha, { attempts = 1, delayMs = 2000 } = {}) {
  const remote = execFileSync('git', ['remote', 'get-url', 'origin'], { encoding: 'utf8' }).trim();
  const match = remote.match(/[/:]([^/:]+\/[^/]+?)(?:\.git)?$/);
  if (!match) throw new Error(`Cannot determine GitHub repository from origin: ${remote}`);
  let runs = [];
  for (let attempt = 0; attempt < attempts && !runs.length; attempt += 1) {
    runs = JSON.parse(execFileSync('gh', ['run', 'list', '--repo', match[1], '--commit', headSha, '--limit', '20', '--json', 'databaseId,url,headSha'], { encoding: 'utf8' }))
      .filter(run => run.headSha === headSha);
    if (!runs.length && attempt + 1 < attempts) waitSync(delayMs);
  }
  if (!runs.length) { log.info(`No CI run exists yet for ${headSha}.`); return { repo: match[1], headSha, runs: [] }; }
  runs.forEach(run => {
    log.info(`Workflow: [${run.url}](${run.url})`);
    const details = JSON.parse(execFileSync('gh', ['run', 'view', String(run.databaseId), '--repo', match[1], '--json', 'jobs'], { encoding: 'utf8' }));
    (details.jobs ?? []).forEach(job => { if (job.url) log.info(`${job.name}: [${job.url}](${job.url})`); });
  });
  return { repo: match[1], headSha, runs };
}

export async function verifyRelease(execFileSync, fs, log, {
  version, release, initialDelayMs = 15000, pollMs = 10000, maxPolls = 30,
  npmRetries = 5, npmRetryMs = 10000, sleep = sleepDefault, linksOnly = false, execFile = defaultExecFile,
} = {}) {
  // Scope boundary: TagIt verifies the organization's repository-named GHCR artifact;
  // custom registries, deployment mutation, and rollback after remote publication belong
  // to DevOps/GitOps and are intentionally outside this library's release contract.
  const repo = repositoryName(execFileSync);
  const tag = `v${version}`;
  const headSha = release.commitSha;
  let run;
  if (initialDelayMs > 0) await sleep(initialDelayMs);
  for (let poll = 0; poll < maxPolls; poll += 1) {
    const runs = await jsonAsync(execFile, 'gh', ['run', 'list', '--repo', repo, '--limit', '50', '--json', 'databaseId,status,conclusion,headSha,headBranch,url']);
    const candidate = runs
      .filter(item => item.headSha === headSha && [tag, `refs/tags/${tag}`, ''].includes(item.headBranch ?? ''))
      .sort((a, b) => Number(b.databaseId) - Number(a.databaseId))[0];
    if (candidate) {
      const details = await jsonAsync(execFile, 'gh', ['run', 'view', String(candidate.databaseId), '--repo', repo, '--json', 'status,conclusion,headSha,jobs,url']);
      if (linksOnly || details.status === 'completed') { run = { ...candidate, ...details }; break; }
      log.info(`Release CI is ${details.status}; waiting...`);
    }
    if (!run && poll + 1 < maxPolls) await sleep(pollMs);
  }
  if (!run) throw new Error(`Release CI did not complete for ${repo}@${tag} (${headSha})`);
  if (linksOnly) {
    log.info(`Release CI discovered for ${repo}@${tag}. Run tagit release-wait to monitor it.`);
    log.info(`Workflow: [${run.url}](${run.url})`);
    (run.jobs ?? []).forEach(job => { if (job.url) log.info(`${job.name}: [${job.url}](${job.url})`); });
    return { repo, tag, headSha, runId: run.databaseId, linksOnly: true };
  }
  const successful = job => job.status === 'completed' && job.conclusion === 'success';
  const jobs = Array.isArray(run.jobs) ? run.jobs : [];
  // Missing jobs are treated as missing required platform evidence below.
  const failed = jobs.filter(job => job.conclusion && job.conclusion !== 'success');
  if (failed.length) throw new Error(`Release CI failed: ${failed.map(job => `${job.name}: ${job.conclusion}`).join('; ')}`);
  if (!jobs.some(job => successful(job) && /ubuntu/i.test(job.name))) throw new Error('Release CI lacks a successful Ubuntu job.');
  if (!jobs.some(job => successful(job) && /windows/i.test(job.name))) throw new Error('Release CI lacks a successful Windows job.');
  const publishJobs = jobs.filter(job => /publish/i.test(job.name));
  const ubuntuJob = jobs.find(job => /ubuntu/i.test(job.name));
  const windowsJob = jobs.find(job => /windows/i.test(job.name));
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
        const visible = (await releaseCommand(execFile, npmExecutable(), ['view', `${packageData.name}@${version}`, 'version'])).trim();
        if (visible === version) { published = true; break; }
      } catch { /* Registry propagation can temporarily return 404. */ }
      await sleep(npmRetryMs);
    }
    if (!published) throw new Error(`npm did not expose ${packageData.name}@${version} after ${npmRetries} attempts.`);
    log.info(`npm verified: ${packageData.name}@${version}.`);
  } else log.info('npm verification: not applicable.');

  const publishesGhcr = workflowFiles(fs).some(file => fs.readFileSync(`.github/workflows/${file}`, 'utf8').includes('ghcr.io'));
  if (publishesGhcr) {
    // Intentional scope: TagIt supports organization-owned, repository-named GHCR
    // images only; personal registries and custom image names require workflow-specific verification.
    const [owner, imageName] = repo.split('/');
    const versions = await jsonAsync(execFile, 'gh', ['api', '--paginate', `/orgs/${encodeURIComponent(owner)}/packages/container/${encodeURIComponent(imageName)}/versions`]);
    const image = versions.find(item => {
      const tags = item.metadata?.container?.tags;
      return Array.isArray(tags) && (tags.includes(version) || tags.includes(tag));
    });
    if (!image) throw new Error(`GHCR does not expose ${repo}:${version}.`);
    const imageDigest = image.name?.startsWith('sha256:') ? image.name : null;
    log.info(`GHCR verified: ${repo}:${version}.`);
    if (imageDigest) log.info(`GHCR digest: ${imageDigest}`);
    return { repo, tag, headSha, ci: true, npm: Boolean(packageData?.name && !packageData.private), ghcr: true, imageDigest };
  } else log.info('GHCR verification: not applicable.');
  return { repo, tag, headSha, ci: true, npm: Boolean(packageData?.name && !packageData.private), ghcr: publishesGhcr };
}
