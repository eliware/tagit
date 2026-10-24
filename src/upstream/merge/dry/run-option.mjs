export function parseUpstreamDryRunOption(args) {
  return {
    dryRun: args.includes("--dry-run"),
    messageArguments: args.filter((argument) => argument !== "--dry-run"),
  };
}
