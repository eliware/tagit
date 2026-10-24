import { quoteWindowsArgument } from "./quote-argument.mjs";

export function buildWindowsNpmCommandString(args) {
  return `npm.cmd ${args.map(quoteWindowsArgument).join(" ")}`;
}
