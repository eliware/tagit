export function processOptions(command, timeout) {
  const options = { stdio: 'pipe', timeout };
  if (command.endsWith('.cmd')) options.shell = true;
  return options;
}
