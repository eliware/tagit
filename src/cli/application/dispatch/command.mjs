import runReleaseCommand from "../../../commands/release/dispatch/command.mjs";
import helpText from "../../guidance/help-text.mjs";
import ownerGuidance from "../../../policy/owner-guidance.mjs";
import registerLifecycle from "../register-lifecycle.mjs";
import dispatchSimpleCommand from "./simple-command.mjs";
import dispatchVersionQuery from "./version.mjs";

const operatorBoundary = ownerGuidance;

export default async function dispatchCommand(options, deps) {
  const { output = console.log } = deps;
  if (dispatchVersionQuery(options, deps)) return;
  if (options.help || !options.command) {
    output(`${operatorBoundary}\n\n${helpText()}`);
    return;
  }
  registerLifecycle(deps);
  if (dispatchSimpleCommand(options.command, options, deps, output)) return;
  await runReleaseCommand(options, deps);
}
