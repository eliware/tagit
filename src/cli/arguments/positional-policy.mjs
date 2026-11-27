export default function validatePositionals(argv, command) {
  for (let index = command ? 1 : 0; index < argv.length; index += 1) {
    if (argv[index] === "--version") {
      index += 1;
      continue;
    }
    if (!argv[index].startsWith("-")) throw new Error("Unexpected positional argument.");
  }
}
