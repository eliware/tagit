export function selectInformationOption(args) {
  if (args.includes("--help") || args.includes("-h")) return "help";
  if (args.includes("--version") || args.includes("-v")) return "version";
  return null;
}
