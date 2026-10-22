export function validateOptionDuplicates(argv) {
  for (const option of ["--dry-run", "--ignore-100x4", "--ignore-monolith-limits"])
    if (argv.filter((argument) => argument === option).length > 1)
      throw new Error(`Duplicate option: ${option}`);
  if (argv.filter((argument) => argument === "--version").length > 1)
    throw new Error("Duplicate option: --version");
  if (argv.filter((argument) => ["--help", "-h"].includes(argument)).length > 1)
    throw new Error("Duplicate option: --help");
}
