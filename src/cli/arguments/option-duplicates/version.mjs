export function validateVersionOptionDuplicates(argv) {
  if (argv.filter((argument) => argument === "--version").length > 1)
    throw new Error("Duplicate option: --version");
}
