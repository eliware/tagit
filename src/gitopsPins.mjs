import path from 'node:path';

const VERSION_RE = /^\d+\.\d+\.\d+$/;
const DIGEST_RE = /^sha256:[a-f0-9]{64}$/;

function safeRelativePath(root, relativePath) {
  const resolvedRoot = path.resolve(root);
  const resolvedPath = path.resolve(resolvedRoot, relativePath);
  if (resolvedPath !== resolvedRoot && !resolvedPath.startsWith(`${resolvedRoot}${path.sep}`)) {
    throw new Error(`Unsafe GitOps path: ${relativePath}`);
  }
  return resolvedPath;
}

export function resolvePins(registry, sourceRepository) {
  if (!registry || registry.version !== 1 || !Array.isArray(registry.pins)) {
    throw new Error('Invalid GitOps image-pin registry.');
  }
  const pins = registry.pins.filter(pin => pin.sourceRepository === sourceRepository);
  if (!pins.length) throw new Error(`No GitOps image-pin mapping for ${sourceRepository}.`);
  for (const pin of pins) {
    if (!pin.image || !pin.overlay || !Array.isArray(pin.files) || !pin.files.length) {
      throw new Error(`Incomplete GitOps image-pin mapping for ${sourceRepository}.`);
    }
  }
  return pins;
}

export function updateGitOpsPins(fs, execFileSync, log, {
  gitopsRoot,
  registryPath = 'apps/image-pins.json',
  sourceRepository,
  version,
  digest,
  dryRun = false,
} = {}) {
  if (!gitopsRoot || !sourceRepository) throw new Error('GitOps root and source repository are required.');
  if (!VERSION_RE.test(version ?? '')) throw new Error(`Invalid release version: ${version}`);
  if (!DIGEST_RE.test(digest ?? '')) throw new Error(`Invalid image digest: ${digest}`);

  const registry = JSON.parse(fs.readFileSync(safeRelativePath(gitopsRoot, registryPath), 'utf8'));
  const pins = resolvePins(registry, sourceRepository);
  const replacement = (_, image) => `image: ${image}:v${version}@${digest}`;
  const changed = [];

  for (const pin of pins) {
    for (const relativeFile of pin.files) {
      const file = safeRelativePath(gitopsRoot, relativeFile);
      const original = fs.readFileSync(file, 'utf8');
      const pattern = new RegExp(`image:\\s*(${pin.image.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&')})(?::[^\\s]+)?`, 'g');
      const updated = original.replace(pattern, replacement);
      const matches = original.match(pattern) ?? [];
      if (!matches.length) throw new Error(`Expected image ${pin.image} was not found in ${relativeFile}.`);
      if (updated !== original) {
        changed.push(relativeFile);
        if (!dryRun) fs.writeFileSync(file, updated, 'utf8');
      }
    }
    if (!dryRun) {
      log.info(`Validating GitOps overlay ${pin.overlay}`);
      execFileSync('kubectl', ['kustomize', '.'], { cwd: safeRelativePath(gitopsRoot, pin.overlay), stdio: 'inherit' });
    }
  }
  return { pins: pins.length, files: [...new Set(changed)] };
}
