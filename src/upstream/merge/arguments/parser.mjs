export function parseUpstreamArguments(args = []) {
  if (!Array.isArray(args)) throw new TypeError("Upstream arguments must be an array.");
  return {
    dryRun: args.includes("--dry-run"),
    messageArguments: args.filter((argument) => argument !== "--dry-run"),
  };
}
