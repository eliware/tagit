import { requireExplicitReleaseVersion } from '../../policy/release-version-policy.mjs';
import { dispatchReleaseWait } from './dispatch-release-wait.mjs';
import { dispatchPreflight } from './dispatch-preflight.mjs';
import { dispatchReleaseOperation } from './dispatch-release-operation.mjs';

export async function runReleaseCommand(
  options,
  { fs, execFileSync, execFile, log, gitOperations, runPreflight, verifyRelease, output = console.log },
) {
  if (options.command === 'release-wait') {
    await dispatchReleaseWait(options, { execFileSync, fs, log, verifyRelease, execFile });
    return;
  }
  if (options.command === 'preflight') {
    dispatchPreflight(options, { runPreflight, execFileSync, fs, log, output });
    return;
  }
  requireExplicitReleaseVersion(options);
  dispatchPreflight(options, { runPreflight, execFileSync, fs, log, output }, false);
  await dispatchReleaseOperation(options, { fs, execFileSync, execFile, log, gitOperations, verifyRelease });
}
