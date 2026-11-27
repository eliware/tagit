export default function validateCommandOptionDuplicates(argv) {
  const option = "--dry-run";
  if (argv.filter((argument) => argument === option).length > 1)
    throw new Error(`Duplicate option: ${option}`);
}
