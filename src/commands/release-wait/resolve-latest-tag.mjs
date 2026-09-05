export function resolveLatestReleaseTag(execFileSync) {
  // codescope ignore: release tags are normalized to the canonical vX.Y.Z form used by Tagit's release policy.
  const version = execFileSync('git', ['describe', '--tags', '--abbrev=0']).toString().trim().replace(/^v/, '');
  if (!/^\d+\.\d+\.\d+$/.test(version)) throw new Error(`Latest tag is not a semantic release tag: v${version}`);
  const commitSha = execFileSync('git', ['rev-list', '-n', '1', `v${version}`]).toString().trim();
  const confirmedSha = execFileSync('git', ['rev-parse', `v${version}`]).toString().trim();
  if (commitSha !== confirmedSha) throw new Error(`Latest tag v${version} changed while it was being resolved.`);
  return { version, commitSha };
}
