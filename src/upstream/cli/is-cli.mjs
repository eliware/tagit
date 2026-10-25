import { normalizeCliExecutableName } from "../../cli/application/executable-name.mjs";

export function isUpstreamCli(argv) {
  const executable = normalizeCliExecutableName(argv[1]);
  return ["upstream", "upstream.mjs", "upstream-cli.mjs"].includes(executable);
}
