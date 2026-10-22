export function validatePositionals(argv, command) {
  for (let index = command ? 1 : 0; index < argv.length; index += 1) {
    if (argv[index] === "--version") {
      index += 1;
      if (!argv[index] && !command && argv.length === 1) continue;
      if (!argv[index] || argv[index].startsWith("-"))
        throw new Error("A value is required after --version.");
      if (!command) throw new Error("The version query does not accept a value.");
      continue;
    }
    if (!argv[index].startsWith("-")) throw new Error("Unexpected positional argument.");
  }
}
