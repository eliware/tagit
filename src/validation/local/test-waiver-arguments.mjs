export function testWaiverArguments({ ignore100x4 = false, ignoreMonolithLimits = false } = {}) {
  const args = [];
  if (ignore100x4 || ignoreMonolithLimits) args.push('--');
  if (ignore100x4) args.push('--ignore-100x4');
  if (ignoreMonolithLimits) args.push('--ignore-monolith-limits');
  return args;
}
