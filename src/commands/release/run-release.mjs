import { isTemplateRepository } from '../../policy/template-repository-policy.mjs';

export async function runReleaseCommand({ options, fs, execFileSync, execFile, log, gitOperations, verifyRelease }) {
  if (options.dryRun) {
    log.info('Dry run passed: release versioning, commit, tag, push, and publication were skipped.');
    return;
  }
  if (isTemplateRepository(fs)) {
    log.info('.notag detected: template release validated; tagging and publishing skipped.');
    return;
  }
  if (fs.existsSync('package.json')) {
    const packageData = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    if (packageData.version !== options.version) throw new Error(`package.json version ${packageData.version} does not match --version ${options.version}.`);
  }
  const release = gitOperations(execFileSync, fs, log, options.version, { dryRun: options.dryRun });
  await verifyRelease(execFileSync, fs, log, { version: options.version, release, linksOnly: true, execFile });
  log.info(`Run tagit release-wait to monitor v${options.version} CI and confirm publication.`);
}
