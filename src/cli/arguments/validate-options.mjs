import { validateAllowedOptions, validateCommandPolicy, validateOptionDuplicates } from './option-policy.mjs';

export function validateOptions(argv, command) {
  validateAllowedOptions(argv);
  if (
    argv.some((argument) => ['--help', '-h'].includes(argument)) &&
    argv.some((argument) => ['--version', '-v'].includes(argument))
  )
    throw new Error('Help and version options cannot be combined.');
  for (let index = command ? 1 : 0; index < argv.length; index += 1) {
    if (argv[index] === '--version') {
      index += 1;
      if (!argv[index] && !command && argv.length === 1) continue;
      if (!argv[index] || argv[index].startsWith('-')) throw new Error('A value is required after --version.');
      if (!command) throw new Error('The version query does not accept a value.');
      continue;
    }
    if (!argv[index].startsWith('-')) throw new Error('Unexpected positional argument.');
  }
  validateOptionDuplicates(argv);
  validateCommandPolicy(argv, command);
}
