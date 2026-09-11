export function preflightOptions(options, report = true) {
  return {
    ignore100x4: options.ignore100x4,
    ignoreMonolithLimits: options.ignoreMonolithLimits,
    report,
  };
}
