export function readRunnerValues(jobLines) {
  const index = jobLines.findIndex((line) => /^\s*runs-on\s*:/.test(line));
  if (index < 0) return null;
  const line = jobLines[index];
  const indent = line.length - line.trimStart().length;
  const value = line.trim().replace(/^runs-on\s*:\s*/, "");
  if (value) {
    const values =
      value.startsWith("[") && value.endsWith("]") ? value.slice(1, -1).split(",") : [value];
    return values.map((item) => item.trim().replace(/^['"]|['"]$/g, ""));
  }
  const values = [];
  for (const next of jobLines.slice(index + 1)) {
    if (next.length - next.trimStart().length <= indent) break;
    const item = /^\s*-\s*(.+)$/.exec(next);
    if (!item) break;
    values.push(item[1].trim().replace(/^['"]|['"]$/g, ""));
  }
  return values;
}

export function classifyRunnerPlatforms(values) {
  const platforms = [];
  if (values.some((value) => /^ubuntu(?:-|$)/i.test(value))) platforms.push("ubuntu");
  if (values.some((value) => /^windows(?:-|$)/i.test(value))) platforms.push("windows");
  return platforms.length === 1 ? platforms : [];
}
