import { readRepositoryName } from '../../repository/repository-name/read-repository-name.mjs';
import { releaseTag } from '../../policy/tag-policy.mjs';

export function resolveReleaseContext(execFileSync, version, release) {
  return {
    repo: readRepositoryName(execFileSync),
    tag: releaseTag(version),
    headSha: release.commitSha,
  };
}
