export function validatePackageFiles(fs, packageData) {
  const failures = [];
  for (const file of packageData.files ?? [])
    if (!fs.existsSync(file.replace(/\/$/, '')))
      failures.push(`BLOCKED: package.json files entry does not exist: ${file}.`);
  for (const file of ['README.md', 'LICENSE', 'RELEASE_NOTES.md'])
    if (packageData.private !== true && !(packageData.files ?? []).some((entry) => entry.replace(/\/$/, '') === file))
      failures.push(`BLOCKED: public file ${file} is not included in package.json files.`);
  return failures;
}
