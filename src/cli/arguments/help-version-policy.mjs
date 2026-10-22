export function validateHelpVersionPolicy(argv) {
  const hasHelp = argv.some((argument) => ["--help", "-h"].includes(argument));
  const hasVersion = argv.some((argument) => ["--version", "-v"].includes(argument));
  if (hasHelp && hasVersion) throw new Error("Help and version options cannot be combined.");
}
