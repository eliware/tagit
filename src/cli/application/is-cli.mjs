import { normalizeCliExecutableName } from "./executable-name.mjs";

export function isCli(argv) {
  const executable = normalizeCliExecutableName(argv[1]);
  return ["tagit", "tagit.mjs", "tagit-cli.mjs", "push", "push-cli.mjs"].includes(executable);
}
