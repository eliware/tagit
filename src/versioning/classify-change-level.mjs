export function classifyChangeLevel(files, diff) {
  if (/(BREAKING CHANGE|\bBREAKING\b|^[+].*(export|exports)|^[+].*"exports"|^[+].*"bin")/mi.test(diff)) return { level: 'major', reason: 'possible breaking public API or command change' };
  if (files.length >= 5 || (diff.match(/^\+/gm) ?? []).length > 200 || /(^|\/)(src|bin)\//i.test(files.join('\n'))) return { level: 'minor', reason: 'substantial implementation or public feature changes' };
  return { level: 'patch', reason: 'small or non-public changes' };
}
