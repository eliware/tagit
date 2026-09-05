const REQUIRED_COMMANDS = ['npm ci', 'npm test', 'npm run lint', 'npm run typecheck', 'npm audit --omit=dev --audit-level=moderate', 'npm run pack'];

export function validateReleaseWorkflow(fs) {
  const failures = [];
  const path = '.github/workflows/nodejs.yml';
  if (!fs.existsSync(path)) return failures;
  const workflow = fs.readFileSync(path, 'utf8');
  for (const command of REQUIRED_COMMANDS) if (!workflow.includes(command)) failures.push(`BLOCKED: release workflow must run ${command}.`);
  if (!/tags:\s*\n\s+-\s*['"]?v\*['"]?/.test(workflow)) failures.push('BLOCKED: release workflow must trigger publication validation for v* tags.');
  if (!/uses:\s*actions\/checkout@/.test(workflow)) failures.push('BLOCKED: release workflow must check out the exact triggering release commit.');
  if (!/publish:\s*\n[\s\S]*needs:\s*[^\n]*build[\s\S]*if:\s*startsWith\(github\.ref, ['"]refs\/tags\/v/.test(workflow)) failures.push('BLOCKED: publish job must depend on validation and run only for v* tags.');
  if (!/permissions:\s*\n\s+contents:\s+read/.test(workflow) || !/publish:[\s\S]*permissions:[\s\S]*id-token:\s+write/.test(workflow)) failures.push('BLOCKED: workflow permissions must be read-only globally and grant id-token write only to publish.');
  return failures;
}
