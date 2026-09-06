export function runPushCommand({ execFileSync, reportCiLinks, log, exit, dryRun }) {
  if (dryRun) {
    log.info('Dry run: no commits were pushed and no CI lookup was performed.');
    return;
  }
  try {
    execFileSync('git', ['push'], { stdio: 'inherit' });
    const headSha = execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
    reportCiLinks(execFileSync, log, headSha, { attempts: 10, delayMs: 2000 });
    log.info('Push completed; untracked files were not staged.');
  } catch (error) {
    log.error(error);
    exit(1);
    throw error;
  }
}
