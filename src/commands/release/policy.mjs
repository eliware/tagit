import { isTemplateRepository } from "../../policy/template-repository-policy.mjs";
import { validatePackageReleaseVersion } from "./validate-package-release-version.mjs";

export function evaluateReleasePolicy(fs, options) {
  if (isTemplateRepository(fs)) return "template";
  validatePackageReleaseVersion(fs, options.version);
  return options.dryRun ? "dry-run" : null;
}
