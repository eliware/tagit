export function buildNpmViewArguments(packageName, version) {
  return ["view", `${packageName}@${version}`, "version", "--json"];
}
