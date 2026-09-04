export function throwPreflightFailures(failures) {
  if (failures.length) throw new Error(`Preflight found ${failures.length} issue(s):\n\n${failures.join('\n\n')}`);
}
