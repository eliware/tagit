import { runReleaseWaitCommand } from '../release-wait/run-release-wait.mjs';
import { runPreflightCommand } from '../preflight/run-preflight.mjs';
import { runReleaseCommand as runReleaseOperation } from './run-release.mjs';
import { requireExplicitReleaseVersion } from '../../policy/release-version-policy.mjs';

export async function runReleaseCommand(options, { fs, execFileSync, execFile, log, gitOperations, runPreflight, verifyRelease, output = console.log }) {
  requireExplicitReleaseVersion(options);
  if (options.command === 'release-wait') { await runReleaseWaitCommand({ execFileSync, fs, log, verifyRelease, execFile }); return; }
  if (options.command === 'preflight') { runPreflightCommand({ runPreflight, execFileSync, fs, log, output, ignore100x4: options.ignore100x4 }); return; }
  runPreflightCommand({ runPreflight, execFileSync, fs, log, output, ignore100x4: options.ignore100x4, report: false });
  await runReleaseOperation({ options, fs, execFileSync, execFile, log, gitOperations, verifyRelease });
}
