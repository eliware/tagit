import { quoteWindowsNpmArgument } from "./windows-command/quote-argument.mjs";

export function buildWindowsNpmCommand(args) {
  return {
    executable: `npm.cmd ${args.map(quoteWindowsNpmArgument).join(" ")}`,
    args: [],
    options: { encoding: "utf8", shell: true },
  };
}
