import { buildWindowsNpmCommand } from "./windows-command.mjs";

export function buildNpmViewCommand(packageName, version, platform = process.platform) {
  const args = ["view", `${packageName}@${version}`, "version", "--json"];
  if (platform === "win32") return buildWindowsNpmCommand(args);
  return { executable: "npm", args, options: { encoding: "utf8" } };
}
