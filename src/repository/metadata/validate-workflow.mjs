import { validateCiWorkflow } from "./validate-ci-workflow.mjs";
import { validatePublicationWorkflow } from "./validate-publication-workflow.mjs";
import { validateNpmPublicationWorkflow } from "./validate-npm-publication-workflow.mjs";
import { validateGhcrPublicationWorkflow } from "./validate-ghcr-publication-workflow.mjs";

export function validateReleaseWorkflow(fs, packageData = {}) {
  const ciFailures = validateCiWorkflow(fs);
  if (ciFailures === null) return [];
  const failures = [...ciFailures];
  const profiles = packageData.eliware?.apply ?? [];
  if (profiles.includes("npm-published")) {
    failures.push(...validatePublicationWorkflow(fs));
    failures.push(...validateNpmPublicationWorkflow(fs));
  }
  if (profiles.includes("ghcr-published")) failures.push(...validateGhcrPublicationWorkflow(fs));
  return failures;
}
