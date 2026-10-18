function valueAfter(line, key) {
  const value = line.trimStart().replace(/^[-] /, "");
  return value.startsWith(`${key}:`) ? value.slice(key.length + 1).trim() : null;
}

export function jobHasCommand(lines, command) {
  return lines.some((line) => valueAfter(line, "run") === command);
}

export function jobHasUse(lines, prefix) {
  return lines.some((line) => String(valueAfter(line, "uses")).startsWith(prefix));
}

export function jobValue(lines, key) {
  const line = lines.find((candidate) => valueAfter(candidate, key) !== null);
  return line ? valueAfter(line, key) : null;
}
