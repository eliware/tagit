const EXCEPTIONS_FILE = '.tagit-exceptions.json';

export function readRepositoryExceptions(fs) {
  if (!fs.existsSync(EXCEPTIONS_FILE)) return {};
  const value = JSON.parse(fs.readFileSync(EXCEPTIONS_FILE, 'utf8'));
  if (
    !value ||
    typeof value !== 'object' ||
    Array.isArray(value) ||
    !value.inapplicable ||
    typeof value.inapplicable !== 'object'
  ) {
    throw new Error(`${EXCEPTIONS_FILE} must contain an object named inapplicable.`);
  }
  for (const [path, reason] of Object.entries(value.inapplicable)) {
    if (!path || typeof reason !== 'string' || !reason.trim())
      throw new Error(`${EXCEPTIONS_FILE} requires a non-empty reason for ${path}.`);
  }
  return value.inapplicable;
}
