export function runPreflightCommand({ runPreflight, execFileSync, fs, log, output, ignore100x4, report = true }) {
  const checks = runPreflight(execFileSync, fs, log, {
    verifyCi: true, strictRepository: true, ignore100x4,
  });
  if (report) {
    log.info('Preflight passed: local gates and exact-HEAD Ubuntu CI are green; Windows CI is optional.');
    output(JSON.stringify({ ok: true, checks }));
  }
  return checks;
}
