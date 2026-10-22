export function reportPushResult(execFileSync, reportCiLinks, log) {
  const headSha = execFileSync("git", ["rev-parse", "HEAD"], { encoding: "utf8" }).trim();
  reportCiLinks(execFileSync, log, headSha, { attempts: 10, delayMs: 2000 });
  log.info("Push completed. The tagit command did not stage untracked files.");
}
