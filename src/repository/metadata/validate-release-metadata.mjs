import { validateReleaseVersion } from './validate-release-version.mjs';
import { validatePackageFiles } from './validate-package-files.mjs';
import { validateOrigin } from './validate-origin.mjs';

export function validateReleaseMetadata(fs, execFileSync, packageData) {
  const failures = [];
  failures.push(...validateReleaseVersion(fs, packageData));
  failures.push(...validatePackageFiles(fs, packageData));
  failures.push(...validateOrigin(execFileSync, packageData));
  return failures;
}
