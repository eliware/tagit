export function readRepositoryName(execFileSync) {
  const remote = execFileSync('git', ['remote', 'get-url', 'origin'], { encoding: 'utf8' }).trim();
  const match = remote.match(/[/:]([^/:]+\/[^/]+?)(?:\.git)?$/);
  if (!match) throw new Error(`Cannot determine GitHub repository from origin: ${remote}`);
  return match[1];
}
