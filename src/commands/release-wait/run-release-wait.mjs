import { resolveLatestReleaseTag } from "./resolve-latest-tag.mjs";

export async function runReleaseWaitCommand({ execFileSync, fs, log, verifyRelease, execFile }) {
  log.info("Starting release-wait checks.");
  const { version, commitSha } = resolveLatestReleaseTag(execFileSync);
  await verifyRelease(execFileSync, fs, log, { version, release: { commitSha }, execFile });
  log.info(`Release ${version} verified successfully.`);
  return { version, commitSha };
}
