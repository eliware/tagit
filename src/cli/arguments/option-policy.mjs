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

export function validateOptionDuplicates(argv) {
  for (const option of ["--dry-run", "--ignore-100x4", "--ignore-monolith-limits"])
    if (argv.filter((argument) => argument === option).length > 1)
      throw new Error(`Duplicate option: ${option}`);
  if (argv.filter((argument) => argument === "--version").length > 1)
    throw new Error("Duplicate option: --version");
  if (argv.filter((argument) => ["--help", "-h"].includes(argument)).length > 1)
    throw new Error("Duplicate option: --help");
}
