const OUTPUT_LIMIT = 12000;

export function collectNotesChanges(execFileSync, tag) {
  // codescope ignore: separate Git queries keep the notes report fields independently bounded and readable.
  const command = (args) => execFileSync('git', args, { encoding: 'utf8' }).trim();
  const commits = command(['log', '--oneline', '--decorate', `${tag}..HEAD`]);
  const files = command(['diff', '--name-status', `${tag}..HEAD`]);
  const diff = command(['diff', `${tag}..HEAD`, '--', '.', ':!package-lock.json', ':!coverage', ':!node_modules']);
  const excerpt =
    diff.length > OUTPUT_LIMIT
      ? `${diff.slice(0, OUTPUT_LIMIT)}\n...[diff truncated at ${OUTPUT_LIMIT} characters]`
      : diff;
  return { commits, files, excerpt };
}
