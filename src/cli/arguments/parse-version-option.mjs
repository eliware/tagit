export function parseVersionOption(argv, { required = false } = {}) {
  const index = argv.findIndex((argument) => argument === '--version');
  if (index === -1) {
    if (required) throw new Error('A release version is required.');
    return null;
  }
  const value = argv[index + 1];
  if (!value || value.startsWith('-')) {
    if (required) throw new Error('A release version is required.');
    return null;
  }
  if (!/^(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)$/.test(value))
    throw new Error(`Invalid release version: ${value}`);
  return value;
}
