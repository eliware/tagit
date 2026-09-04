import path from 'node:path';

/** Find workflow files that declare an organization-owned GHCR publication. */
export function publishesGhcr(fs) {
  const directory = '.github/workflows';
  if (!fs.existsSync(directory)) return false;
  return fs.readdirSync(directory)
    .filter(file => /\.(yml|yaml)$/i.test(file))
    .some(file => /(^|\s|["'])ghcr\.io\/[\w.-]+\/[\w./-]+/.test(fs.readFileSync(path.join(directory, file), 'utf8')));
}
