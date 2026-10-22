export function classifyRunnerPlatforms(values) {
  const platforms = [];
  if (values.some((value) => /^ubuntu(?:-|$)/i.test(value))) platforms.push("ubuntu");
  if (values.some((value) => /^windows(?:-|$)/i.test(value))) platforms.push("windows");
  return platforms.length === 1 ? platforms : [];
}
