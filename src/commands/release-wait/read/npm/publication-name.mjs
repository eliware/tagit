export function validateNpmPublicationName(packageName, isPrivate) {
  if (!packageName && !isPrivate)
    throw new Error("Public package.json must declare a name for npm publication verification.");
  if (packageName && !/^(?:@[a-z0-9._-]+\/)?[a-z0-9._-]+$/i.test(packageName))
    throw new Error("package.json name is invalid for publication verification.");
  return packageName;
}
