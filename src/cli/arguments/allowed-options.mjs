const allowedOptions = new Set(["--help", "-h", "--version", "-v", "--dry-run"]);

export default function validateAllowedOptions(argv) {
  for (const argument of argv.slice(1))
    if (argument.startsWith("-") && !allowedOptions.has(argument))
      throw new Error(`Unknown option: ${argument}`);
}
