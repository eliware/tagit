import { parseOptions } from '../arguments/parse-options.mjs';
import { dispatchCommand } from './dispatch-command.mjs';
import { handleCliError } from './handle-cli-error.mjs';
import { formatParseError } from './format-parse-error.mjs';

export async function runCliBoundary(dependencies, argv) {
  const { log, exit } = dependencies;
  let options;
  try {
    options = parseOptions(argv);
  } catch (error) {
    handleCliError(error, { log, exit, format: formatParseError });
  }
  try {
    await dispatchCommand(options, dependencies);
  } catch (error) {
    handleCliError(error, { log, exit });
  }
}
