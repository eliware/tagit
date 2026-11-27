function valueAfter(line, key) {
  const value = line.trimStart().replace(/^[-] /, "");
  return value.startsWith(`${key}:`) ? value.slice(key.length + 1).trim() : null;
}

export default function jobHasUse(lines, prefix) {
  return lines.some((line) => String(valueAfter(line, "uses")).startsWith(prefix));
}
