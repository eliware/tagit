import { findMissingRepositoryFiles, missingFileMessage } from "./metadata/required-files.mjs";
import {
  missingPackageMetadata,
  missingMetadataMessage,
} from "./metadata/validate-package-metadata.mjs";
import { readPackageJson } from "./metadata/read-package-json.mjs";
import { validateReleaseMetadata } from "./metadata/validate-release-metadata.mjs";
import { validateReleaseWorkflow } from "./metadata/validate-workflow.mjs";

export function validateMetadata(fs, failures, execFileSync = null) {
  try {
    const packageData = readPackageJson(fs);
    for (const file of findMissingRepositoryFiles(fs, packageData))
      failures.push(missingFileMessage(file));
    for (const field of missingPackageMetadata(packageData))
      failures.push(missingMetadataMessage(field));
    if (execFileSync) {
      failures.push(...validateReleaseMetadata(fs, execFileSync, packageData));
      failures.push(...validateReleaseWorkflow(fs, packageData));
    }
  } catch (error) {
    failures.push(`BLOCKED: package metadata validation failed: ${error.message}`);
  }
}
