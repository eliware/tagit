export function readCiRun(execFileSync, runId) {
  const output = execFileSync('gh', ['run', 'view', String(runId), '--json', 'status,conclusion,headSha,jobs'], { encoding: 'utf8' });
  return JSON.parse(output);
}
