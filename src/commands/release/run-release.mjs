import { isTemplateRepository } from "../../policy/template-repository-policy.mjs";
import { validatePackageReleaseVersion } from "./validate-package-release-version.mjs";

export async function runReleaseCommand({
  options,
  fs,
  execFileSync,
  execFile,
  log,
  gitOperations,
  verifyRelease,
}) {
  if (isTemplateRepository(fs)) {
    log.info(".notag detected. TagIt checked the template and skipped tagging and publication.");
    return;
  }
  validatePackageReleaseVersion(fs, options.version);
  if (options.dryRun) {
    log.info(
      "Dry run passed: release versioning, commit, tag, push, and publication were skipped.",
    );
    return;
  }
  const release = gitOperations(execFileSync, fs, log, options.version, { dryRun: options.dryRun });
  await verifyRelease(execFileSync, fs, log, {
    version: options.version,
    release,
    linksOnly: true,
    execFile,
  });
  log.info(
    `Run tagit release-wait to check CI and applicable publication for v${options.version}.`,
  );
}
