import { classifyCommand } from './classify-command.mjs';
import { parseVersionOption } from './parse-version-option.mjs';
import { validateOptions } from './validate-options.mjs';

export function isHelp(argv) { return argv.includes('--help') || argv.includes('-h'); }
export function getReleaseVersion(argv, options = {}) { return parseVersionOption(argv, options); }
export function parseOptions(argv) {
  const command = classifyCommand(argv); validateOptions(argv, command);
  if (command === 'release') parseVersionOption(argv, { required: true });
  return { command, help: isHelp(argv), versionQuery: !command && (argv.includes('--version') || argv.includes('-v')), ignore100x4: argv.includes('--ignore-100x4'), dryRun: argv.includes('--dry-run'), version: command === 'release' || command === 'release-wait' ? parseVersionOption(argv) : null };
}
