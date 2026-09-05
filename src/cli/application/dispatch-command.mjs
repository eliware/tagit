import { runReleaseCommand } from '../../commands/release/dispatch.mjs';
import { helpText } from '../guidance/help-text.mjs';
import { ownerGuidance } from '../../policy/owner-guidance.mjs';
import { registerLifecycle } from './register-lifecycle.mjs';
import { dispatchSimpleCommand } from './dispatch-simple-command.mjs';

export const operatorBoundary = ownerGuidance;

export async function dispatchCommand(options, deps) {
  const { output = console.log } = deps;
  if (options.versionQuery) { output(deps.packageVersion); return; }
  if (options.help || !options.command) { output(`${operatorBoundary}\n\n${helpText()}`); return; }
  registerLifecycle(deps);
  if (dispatchSimpleCommand(options.command, options, deps, output)) return;
  await runReleaseCommand(options, deps);
}
