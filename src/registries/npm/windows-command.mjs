export function buildWindowsNpmCommand(args) {
  return {
    executable: `npm.cmd ${args.map((argument) => `"${argument}"`).join(" ")}`,
    args: [],
    options: { encoding: "utf8", shell: true },
  };
}
