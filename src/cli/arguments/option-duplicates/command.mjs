export function validateCommandOptionDuplicates(argv) {
  for (const option of ["--dry-run", "--ignore-100x4", "--ignore-monolith-limits"])
    if (argv.filter((argument) => argument === option).length > 1)
      throw new Error(`Duplicate option: ${option}`);
}
