function valueAfter(line, key) {
  const value = line.trimStart().replace(/^[-] /, "");
  return value.startsWith(`${key}:`) ? value.slice(key.length + 1).trim() : null;
}

export function hasTagTrigger(lines) {
  const push = lines.findIndex(
    (line) => line.length - line.trimStart().length === 2 && valueAfter(line, "push") !== null,
  );
  if (push < 0) return false;
  const nextEvent = lines.findIndex(
    (line, index) =>
      index > push &&
      line.length - line.trimStart().length === 2 &&
      valueAfter(line, line.trim().slice(0, -1)) !== null,
  );
  const pushLines = lines.slice(push + 1, nextEvent < 0 ? undefined : nextEvent);
  const tags = pushLines.findIndex(
    (line) => line.length - line.trimStart().length === 4 && valueAfter(line, "tags") !== null,
  );
  if (tags < 0) return false;
  return pushLines.slice(tags + 1).some((line) => {
    const indent = line.length - line.trimStart().length;
    const value = line.trim().replaceAll("'", "").replaceAll('"', "");
    return indent === 6 && value === "- v[0-9]*.[0-9]*.[0-9]*";
  });
}
