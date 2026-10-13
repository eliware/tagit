function valueAfter(line, key) {
  const value = line.trimStart().replace(/^[-] /, "");
  return value.startsWith(`${key}:`) ? value.slice(key.length + 1).trim() : null;
}

export function hasTagTrigger(lines) {
  const tags = lines.findIndex((line) => valueAfter(line, "tags") !== null);
  return (
    tags >= 0 &&
    lines
      .slice(tags + 1)
      .some((line) =>
        ["- v[0-9]*.[0-9]*.[0-9]*"].includes(line.trim().replaceAll("'", "").replaceAll('"', "")),
      )
  );
}
