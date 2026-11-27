function valueAfter(line, key) {
  const value = line.trimStart().replace(/^[-] /, "");
  return value.startsWith(`${key}:`) ? value.slice(key.length + 1).trim() : null;
}

export default function jobHasCommand(lines, command) {
  return lines.some((line) => valueAfter(line, "run") === command);
}
