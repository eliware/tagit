import classifyCommand from "../classify-command.mjs";
import parseVersionOption from "./version-option.mjs";
import validateOptions from "../validate-options.mjs";
import isHelp from "./is-help.mjs";

export default function parseOptions(argv) {
  const command = classifyCommand(argv);
  validateOptions(argv, command);
  return {
    command,
    help: isHelp(argv),
    versionQuery: !command && (argv.includes("--version") || argv.includes("-v")),
    dryRun: argv.includes("--dry-run"),
    version: command === "release" || command === "release-wait" ? parseVersionOption(argv) : null,
  };
}
