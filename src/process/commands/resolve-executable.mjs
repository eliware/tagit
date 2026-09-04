export function resolveExecutable(executable, platform = process.platform) {
  if (platform !== 'win32') return executable;
  return ['npm', 'npx', 'composer'].includes(executable) ? `${executable}.cmd` : executable;
}
