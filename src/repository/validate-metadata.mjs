import { findMissingRepositoryFiles, missingFileMessage } from './metadata/required-files.mjs';
import { missingPackageMetadata, missingMetadataMessage } from './metadata/validate-package-metadata.mjs';
import { readPackageJson } from './metadata/read-package-json.mjs';

export function validateMetadata(fs, failures) {
  for (const file of findMissingRepositoryFiles(fs)) failures.push(missingFileMessage(file));
  try {
    const packageData = readPackageJson(fs);
    for (const field of missingPackageMetadata(packageData)) failures.push(missingMetadataMessage(field));
  } catch (error) {
    failures.push(`BLOCKED: package metadata validation failed: ${error.message}`);
  }
}
