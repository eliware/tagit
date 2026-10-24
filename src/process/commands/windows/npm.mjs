import { buildWindowsNpmCommandString } from "./command-string.mjs";

export function buildWindowsNpmCommand(args) {
  return {
    executable: buildWindowsNpmCommandString(args),
    args: [],
    options: { encoding: "utf8", shell: true },
  };
}
