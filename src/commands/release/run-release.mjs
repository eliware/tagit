import evaluateReleasePolicy from "./policy.mjs";

export default async function runReleaseCommand({ options, fs, execFileSync, log, gitOperations }) {
  const policyResult = evaluateReleasePolicy(fs, options);
  if (policyResult === "template") {
    log.info(
      ".notag detected. The tagit command checked the template and skipped tagging and publication.",
    );
    return;
  }
  if (policyResult === "dry-run") {
    log.info("Dry run passed: preflight, release commit, tag, push, and publication were skipped.");
    return;
  }
  gitOperations(execFileSync, fs, log, options.version, { dryRun: options.dryRun });
  log.info(
    `Run tagit release-wait to check CI and applicable publication for v${options.version}.`,
  );
}
