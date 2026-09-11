const REQUIRED_COMMANDS = ['npm ci', 'npm test'];

function indentation(line) {
  return line.length - line.trimStart().length;
}

function valueAfter(line, key) {
  const prefix = `${key}:`;
  const value = line.trimStart().replace(/^[-] /, '');
  return value.startsWith(prefix) ? value.slice(prefix.length).trim() : null;
}

function parseWorkflow(text) {
  const lines = text.split(/\r?\n/).filter((line) => line.trim() && !line.trimStart().startsWith('#'));
  const sections = new Map();
  for (let index = 0; index < lines.length; index += 1) {
    if (indentation(lines[index]) === 0 && lines[index].trimEnd().endsWith(':')) {
      const key = lines[index].trim().slice(0, -1);
      const end = lines.findIndex((line, candidate) => candidate > index && indentation(line) === 0);
      sections.set(key, lines.slice(index + 1, end === -1 ? lines.length : end));
    }
  }
  return sections;
}

function hasTagTrigger(lines) {
  const tags = lines.findIndex((line) => valueAfter(line, 'tags') !== null);
  return (
    tags >= 0 && lines.slice(tags + 1).some((line) => line.trim().replaceAll("'", '').replaceAll('"', '') === '- v*')
  );
}

function parseJobs(lines) {
  const jobs = new Map();
  for (let index = 0; index < lines.length; index += 1) {
    if (indentation(lines[index]) !== 2 || !lines[index].trimEnd().endsWith(':')) continue;
    const name = lines[index].trim().slice(0, -1);
    const end = lines.findIndex((line, candidate) => candidate > index && indentation(line) === 2);
    jobs.set(name, lines.slice(index + 1, end === -1 ? lines.length : end));
  }
  return jobs;
}

function jobHasCommand(lines, command) {
  return lines.some((line) => valueAfter(line, 'run') === command);
}

function jobHasUse(lines, prefix) {
  return lines.some((line) => String(valueAfter(line, 'uses')).startsWith(prefix));
}

function jobValue(lines, key) {
  const line = lines.find((candidate) => valueAfter(candidate, key) !== null);
  return line ? valueAfter(line, key) : null;
}

export function validateReleaseWorkflow(fs) {
  const failures = [];
  const path = '.github/workflows/nodejs.yml';
  if (!fs.existsSync(path)) return failures;
  const sections = parseWorkflow(fs.readFileSync(path, 'utf8'));
  const trigger = sections.get('on') ?? sections.get('"on"') ?? [];
  const permissions = sections.get('permissions') ?? [];
  const jobs = parseJobs(sections.get('jobs') ?? []);
  const validate = jobs.get('validate') ?? jobs.get('build') ?? [];
  const publish = jobs.get('publish') ?? [];
  for (const command of REQUIRED_COMMANDS)
    if (!jobHasCommand(validate, command)) failures.push(`BLOCKED: release workflow must run ${command}.`);
  if (!hasTagTrigger(trigger))
    failures.push('BLOCKED: release workflow must trigger publication validation for v* tags.');
  if (!jobHasUse(validate, 'actions/checkout@') && !jobHasUse(publish, 'actions/checkout@'))
    failures.push('BLOCKED: release workflow must check out the exact triggering release commit.');
  const validationJob = 'validate';
  const fallbackValidationJob = jobs.has('validate') ? validationJob : 'build';
  if (jobValue(publish, 'needs') !== fallbackValidationJob || !String(jobValue(publish, 'if')).includes('refs/tags/v'))
    failures.push('BLOCKED: publication must depend on validation and run only for v* tags.');
  const globalPermissions = permissions.some((line) => valueAfter(line, 'contents') === 'read');
  const publishPermissions = publish.some((line) => valueAfter(line, 'id-token') === 'write');
  if (!globalPermissions || !publishPermissions)
    failures.push('BLOCKED: workflow permissions must be read-only globally and grant id-token write only to publish.');
  if (!jobs.has('publish')) failures.push('BLOCKED: public package publication job must be named publish.');
  return failures;
}
