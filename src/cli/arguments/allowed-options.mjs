const allowedOptions = new Set([
  "--help",
  "-h",
  "--version",
  "-v",
  "--dry-run",
  "--ignore-100x4",
  "--ignore-monolith-limits",
]);

export function validateAllowedOptions(argv) {
  for (const argument of argv.slice(1))
    if (argument.startsWith("-") && !allowedOptions.has(argument))
      throw new Error(`Unknown option: ${argument}`);
}
