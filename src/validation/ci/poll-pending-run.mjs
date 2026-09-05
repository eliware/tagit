export function pollPendingRun(execFileSync, log, pending, repoArg, attempt) {
  if (!pending || attempt >= 30) return false;
  if (pending.url) log.info(`CI in progress; waiting for completion: [workflow run ${pending.databaseId}](${pending.url})`);
  try {
    execFileSync('gh', ['run', 'watch', String(pending.databaseId), ...repoArg, '--exit-status', '--interval', '10'], { encoding: 'utf8', timeout: 10000 });
  } catch { /* Re-read completed state; watch can time out while CI continues. */ }
  return true;
}
