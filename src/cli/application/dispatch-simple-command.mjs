import { runNotesCommand } from '../../commands/notes/run-notes.mjs';
import { runPushCommand } from '../../commands/push/run-push.mjs';

export function dispatchSimpleCommand(command, options, deps, output) {
  if (command === 'notes') {
    runNotesCommand({ fs: deps.fs, execFileSync: deps.execFileSync, buildNotesReport: deps.buildNotesReport, output });
    return true;
  }
  if (command === 'push') {
    runPushCommand({
      execFileSync: deps.execFileSync,
      reportCiLinks: deps.reportCiLinks,
      log: deps.log,
      exit: deps.exit,
      dryRun: options.dryRun,
    });
    return true;
  }
  return false;
}
