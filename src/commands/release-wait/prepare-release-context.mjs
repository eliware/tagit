import { readPublicationTarget } from "./read/publication-target.mjs";
import { readReleaseRunnerLabels } from "./read/runner-labels.mjs";
import { resolveReleaseContext } from "./resolve/release-context.mjs";
import { validateReleaseInput } from "./validate/input.mjs";

export function prepareReleaseContext(execFileSync, fs, options) {
  const { version, release, maxPolls, npmRetries, pollMs, npmRetryMs } = options;
  validateReleaseInput(version, release, maxPolls, npmRetries, pollMs, npmRetryMs);
  const context = resolveReleaseContext(execFileSync, version, release);
  const publication = readPublicationTarget(fs);
  const runnerLabelsByJobName = readReleaseRunnerLabels(execFileSync, context.headSha, publication);
  return { ...context, publication, runnerLabelsByJobName };
}
