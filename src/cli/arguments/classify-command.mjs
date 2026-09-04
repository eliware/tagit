const commands = ['notes', 'preflight', 'push', 'release', 'release-wait'];

export function classifyCommand(argv) {
  if (argv[0]?.startsWith('-') && argv.some(argument => commands.includes(argument))) {
    throw new Error('The command must precede options.');
  }
  const command = argv[0] && !['--help', '-h', '--version', '-v'].includes(argv[0]) ? argv[0] : undefined;
  if (command && !commands.includes(command)) throw new Error(`Unknown command: ${command}`);
  return command;
}

export { commands };
