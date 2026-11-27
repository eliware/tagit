export default function parseUpstreamArguments(args = []) {
  if (!Array.isArray(args)) throw new TypeError("Upstream arguments must be an array.");
  let dryRun = false;
  const messageArguments = [];
  for (const argument of args) {
    if (argument === "--dry-run") {
      if (messageArguments.length)
        throw new Error("The --dry-run option must appear before the merge message.");
      if (dryRun) throw new Error("The --dry-run option cannot appear more than once.");
      dryRun = true;
      continue;
    }
    if (argument.startsWith("-")) throw new Error(`Unknown upstream option: ${argument}.`);
    messageArguments.push(argument);
  }
  return {
    dryRun,
    messageArguments,
  };
}
