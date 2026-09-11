export function buildDispatchContext(dependencies) {
  const {
    fs,
    execFileSync,
    execFile,
    log,
    gitOperations,
    runPreflight,
    registerHandlersFn,
    registerSignalsFn,
    verifyRelease,
    buildNotesReport,
    reportCiLinks,
    exit,
    packageVersion,
    output,
  } = dependencies;
  return {
    fs,
    execFileSync,
    execFile,
    log,
    gitOperations,
    runPreflight,
    registerHandlersFn,
    registerSignalsFn,
    verifyRelease,
    buildNotesReport,
    reportCiLinks,
    exit,
    packageVersion,
    output,
  };
}
