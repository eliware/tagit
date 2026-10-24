export function selectInformationOption(args) {
  if (!Array.isArray(args)) throw new TypeError("Upstream arguments must be an array.");
  const hasHelp = args.some((argument) => ["--help", "-h"].includes(argument));
  const hasVersion = args.some((argument) => ["--version", "-v"].includes(argument));
  if (!hasHelp && !hasVersion) return null;
  if (args.length !== 1 || hasHelp === hasVersion)
    throw new Error("Upstream information options must be used alone.");
  if (hasHelp) return "help";
  return "version";
}
