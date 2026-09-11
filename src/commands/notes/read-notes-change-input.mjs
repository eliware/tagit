export function readNotesChangeInput(execFileSync) {
  const run = (args) => execFileSync('git', args, { encoding: 'utf8' });
  const latestTag = run(['describe', '--tags', '--abbrev=0']).trim();
  const changedFiles = run(['diff', '--name-only', `${latestTag}..HEAD`]);
  const diff = run([
    'diff',
    '--unified=0',
    `${latestTag}..HEAD`,
    '--',
    '.',
    ':!package-lock.json',
    ':!coverage',
    ':!node_modules',
  ]);
  return { latestTag, changedFiles, diff };
}
