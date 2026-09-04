const secretPattern = /(^|[\\/])(?:\.env(?:$|\.(?!example$))|id_rsa(?:\.|$)|credentials(?:\.|[\\/]|$)|secrets?(?:\.|[\\/]|$))/i;

export function findSecretLookingPaths(files) {
  return files.split(/\r?\n/).filter(file => secretPattern.test(file));
}

export function secretFilesMessage(files) {
  return `BLOCKED: tracked secret-looking files were found:\n${files.join('\n')}\nAction: remove secrets from Git and rerun tagit preflight.`;
}
