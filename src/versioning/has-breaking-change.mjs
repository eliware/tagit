export function hasBreakingChange(diff) {
  return /(BREAKING CHANGE|\bBREAKING\b|^[+].*(export|exports)|^[+].*"exports"|^[+].*"bin")/im.test(
    diff,
  );
}
