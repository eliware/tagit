export function buildNpmViewCommand(packageName, version, platform = process.platform) {
  if (!/^(?:@[a-z0-9._-]+\/)?[a-z0-9._-]+$/i.test(packageName ?? ""))
    throw new Error("Package name is invalid for npm publication verification.");
  if (!/^(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)$/.test(version ?? ""))
    throw new Error("Version is invalid for npm publication verification.");
  const args = ["view", `${packageName}@${version}`, "version", "--json"];
  if (platform === "win32")
    return {
      executable: `npm.cmd ${args.map((argument) => `"${argument}"`).join(" ")}`,
      args: [],
      options: { encoding: "utf8", shell: true },
    };
  return { executable: "npm", args, options: { encoding: "utf8" } };
}
