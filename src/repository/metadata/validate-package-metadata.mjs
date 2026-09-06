export function missingPackageMetadata(packageData) {
  const missing = ['name', 'version', 'description', 'author', 'repository', 'homepage', 'license'].filter(
    (field) => !packageData[field],
  );
  if (!Array.isArray(packageData.keywords) || packageData.keywords.length === 0) missing.push('keywords');
  if (!packageData.repository?.url) missing.push('repository.url');
  if (!packageData.scripts?.test) missing.push('scripts.test');
  if (!packageData.scripts?.lint) missing.push('scripts.lint');
  if (packageData.private !== true && (!Array.isArray(packageData.files) || packageData.files.length === 0))
    missing.push('files');
  if (packageData.private !== true && packageData.publishConfig?.access !== 'public')
    missing.push('publishConfig.access=public');
  if (packageData.bugs !== undefined && !packageData.bugs.url) missing.push('bugs.url');
  return missing;
}

export function missingMetadataMessage(field) {
  return `BLOCKED: package.json is missing metadata: ${field}. Action: correct package metadata and rerun tagit preflight.`;
}
