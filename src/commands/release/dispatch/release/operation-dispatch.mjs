import runReleaseCommand from "../../run-release.mjs";

export default function dispatchReleaseOperation(options, dependencies) {
  const { runReleaseCommand: run = runReleaseCommand, ...rest } = dependencies;
  return run({ options, ...rest });
}
