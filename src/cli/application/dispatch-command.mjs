import { runNotesCommand } from '../../commands/notes/run-notes.mjs';
import { runPushCommand } from '../../commands/push/run-push.mjs';
import { runReleaseCommand } from '../../commands/release/dispatch.mjs';
import { helpText } from '../guidance/help-text.mjs';
import { ownerGuidance } from '../../policy/owner-guidance.mjs';

export const operatorBoundary = ownerGuidance;

export async function dispatchCommand(options, deps) {
  const { output = console.log } = deps;
  if (options.versionQuery) { output(deps.packageVersion); return; }
  if (options.help || !options.command) { output(`${operatorBoundary}\n\n${helpText()}`); return; }
  deps.registerHandlersFn({ log: deps.log });
  deps.registerSignalsFn({ log: deps.log });
  if (options.command === 'notes') {
    runNotesCommand({ fs: deps.fs, execFileSync: deps.execFileSync, buildNotesReport: deps.buildNotesReport, output });
    return;
  }
  if (options.command === 'push') {
    runPushCommand({ execFileSync: deps.execFileSync, reportCiLinks: deps.reportCiLinks, log: deps.log, exit: deps.exit, dryRun: options.dryRun });
    return;
  }
  await runReleaseCommand(options, deps);
}
