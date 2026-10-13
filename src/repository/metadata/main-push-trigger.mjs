function indentation(line) {
  return line.length - line.trimStart().length;
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
