function quoteWindowsArgument(argument) {
  return `"${argument}"`;
}

export function buildWindowsNpmCommand(args) {
  return {
    executable: `npm.cmd ${args.map(quoteWindowsArgument).join(" ")}`,
    args: [],
    options: { encoding: "utf8", shell: true },
  };
}
