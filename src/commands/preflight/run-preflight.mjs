export default function runPreflightCommand({
  runPreflight,
  execFileSync,
  fs,
  log,
  output,
  report = true,
}) {
  const checks = runPreflight(execFileSync, fs, log, {
    verifyCi: true,
    strictRepository: true,
  });
  if (report) {
    log.info("Preflight passed: local gates and exact-HEAD Ubuntu CI are green.");
    output(JSON.stringify({ ok: true, checks }));
  }
  return checks;
}
