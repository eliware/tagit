function indentation(line) {
  return line.length - line.trimStart().length;
}

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

export function hasMainPushTrigger(lines) {
  const push = lines.findIndex((line) => line.trim() === "push:");
  if (push < 0) return false;
  const end = lines.findIndex(
    (line, index) => index > push && indentation(line) <= indentation(lines[push]),
  );
  return lines
    .slice(push + 1, end < 0 ? undefined : end)
    .some((line) => /^\s*-\s*main\s*$/.test(line));
}
