const allowedOptions = new Set([
  '--help',
  '-h',
  '--version',
  '-v',
  '--dry-run',
  '--ignore-100x4',
  '--ignore-monolith-limits',
]);

export function validateAllowedOptions(argv) {
  for (const argument of argv.slice(1))
    if (argument.startsWith('-') && !allowedOptions.has(argument)) throw new Error(`Unknown option: ${argument}`);
}

export function validateOptionDuplicates(argv) {
  for (const option of ['--dry-run', '--ignore-100x4', '--ignore-monolith-limits'])
    if (argv.filter((argument) => argument === option).length > 1) throw new Error(`Duplicate option: ${option}`);
  if (argv.filter((argument) => argument === '--version').length > 1) throw new Error('Duplicate option: --version');
  if (argv.filter((argument) => ['--help', '-h'].includes(argument)).length > 1)
    throw new Error('Duplicate option: --help');
}

export function validateCommandPolicy(argv, command) {
  if (argv.includes('--ignore-100x4') && !['preflight', 'release'].includes(command))
    throw new Error('--ignore-100x4 requires preflight or release.');
  if (argv.includes('--ignore-monolith-limits') && !['preflight', 'release'].includes(command))
    throw new Error('--ignore-monolith-limits requires preflight or release.');
  if (argv.includes('--dry-run') && !['push', 'release'].includes(command))
    throw new Error('--dry-run requires push or release.');
  if (command && argv.includes('--version') && !['release', 'release-wait'].includes(command))
    throw new Error('--version requires release or release-wait; use --version alone to query TagIt.');
  if (command === 'release-wait' && argv.includes('--version'))
    throw new Error('release-wait always verifies the latest tag; do not pass --version.');
}
