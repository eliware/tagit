export function validateHelpOptionDuplicates(argv) {
  if (argv.filter((argument) => ["--help", "-h"].includes(argument)).length > 1)
    throw new Error("Duplicate option: --help");
}
