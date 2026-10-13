export function isSubstantialChange(files, diff) {
  return (
    files.length >= 5 ||
    (diff.match(/^\+/gm) ?? []).length > 200 ||
    /(^|\/)(src|bin)\//i.test(files.join("\n"))
  );
}
