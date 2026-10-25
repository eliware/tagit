export function parseRunnerValues(declaration) {
  if (declaration === null) return null;
  if (declaration.value) {
    const values =
      declaration.value.startsWith("[") && declaration.value.endsWith("]")
        ? declaration.value.slice(1, -1).split(",")
        : [declaration.value];
    return values.map((item) => item.trim().replace(/^['"]|['"]$/g, ""));
  }
  const values = [];
  for (const line of declaration.blockLines) {
    const item = /^\s*-\s*(.+)$/.exec(line);
    if (!item) break;
    values.push(item[1].trim().replace(/^['"]|['"]$/g, ""));
  }
  return values;
}
