export function validateOptions(argv, command) {
  const allowed = new Set(['--help', '-h', '--version', '-v', '--dry-run', '--ignore-100x4']);
  for (const argument of argv.slice(1)) {
    if (argument.startsWith('-') && !allowed.has(argument)) throw new Error(`Unknown option: ${argument}`);
  }
  if (argv.some(argument => ['--help', '-h'].includes(argument)) && argv.some(argument => ['--version', '-v'].includes(argument))) throw new Error('Help and version options cannot be combined.');
  for (let index = command ? 1 : 0; index < argv.length; index += 1) {
    if (argv[index] === '--version') {
      index += 1;
      if (!argv[index] && !command && argv.length === 1) continue;
      if (!argv[index] || argv[index].startsWith('-')) throw new Error('A value is required after --version.');
      continue;
    }
    if (!argv[index].startsWith('-')) throw new Error('Unexpected positional argument.');
  }
  for (const option of ['--dry-run', '--ignore-100x4']) {
    if (argv.filter(argument => argument === option).length > 1) throw new Error(`Duplicate option: ${option}`);
  }
  if (argv.filter(argument => argument === '--version').length > 1) throw new Error('Duplicate option: --version');
  if (argv.filter(argument => ['--help', '-h'].includes(argument)).length > 1) throw new Error('Duplicate option: --help');
  if (argv.includes('--ignore-100x4') && !['preflight', 'release'].includes(command)) throw new Error('--ignore-100x4 requires preflight or release.');
  if (argv.includes('--dry-run') && !['push', 'release'].includes(command)) throw new Error('--dry-run requires push or release.');
  if (command && argv.includes('--version') && !['release', 'release-wait'].includes(command)) throw new Error('--version requires release or release-wait; use --version alone to query TagIt.');
  if (command === 'release-wait' && argv.includes('--version')) throw new Error('release-wait always verifies the latest tag; do not pass --version.');
}
