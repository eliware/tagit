export function missingPackageMetadata(packageData) {
  return ['name', 'version', 'description', 'license'].filter(field => !packageData[field]);
}

export function missingMetadataMessage(field) {
  return `BLOCKED: package.json is missing metadata: ${field}. Action: correct package metadata and rerun tagit preflight.`;
}
