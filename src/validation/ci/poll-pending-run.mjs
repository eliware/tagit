export function pollPendingRun(execFileSync, log, pending, repoArg, attempt) {
  if (!pending || attempt >= 30) return false;
  if (pending.url)
    log.info(`CI is running. Status: [workflow run ${pending.databaseId}](${pending.url})`);
  try {
    execFileSync(
      "gh",
      ["run", "watch", String(pending.databaseId), ...repoArg, "--exit-status", "--interval", "10"],
      {
        encoding: "utf8",
        timeout: 10000,
      },
    );
  } catch {
    /* Read the run state again. The monitor can time out while CI continues. */
  }
  return true;
}
