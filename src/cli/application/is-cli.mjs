import path from "path";
export function isCli(argv) {
  const executable = argv[1] ? path.basename(argv[1].replaceAll("\\", "/")) : "";
  return ["tagit", "tagit.mjs", "tagit-cli.mjs", "push", "push-cli.mjs"].includes(executable);
}
