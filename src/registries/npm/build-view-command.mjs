export function buildNpmViewCommand(packageName, version, platform = process.platform) {
  const args = ["view", `${packageName}@${version}`, "version", "--json"];
  if (platform === "win32")
    return {
      executable: `npm.cmd ${args.map((argument) => `"${argument}"`).join(" ")}`,
      args: [],
      options: { encoding: "utf8", shell: true },
    };
  return { executable: "npm", args, options: { encoding: "utf8" } };
}
