export default function dispatchVersionQuery(options, dependencies) {
  if (!options.versionQuery) return false;
  const { output = console.log } = dependencies;
  output(dependencies.packageVersion);
  return true;
}
