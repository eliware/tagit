import { parseSemver } from "../../versioning/parse-semver.mjs";

function compareVersion(actual, declared) {
  for (let index = 0; index < actual.length; index += 1) {
    if (actual[index] !== declared[index]) return actual[index] - declared[index];
  }
  return 0;
}

export function satisfiesDeclaredRange(version, range) {
  const match = /^(\^|~)?((?:0|[1-9]\d*)\.(?:0|[1-9]\d*)\.(?:0|[1-9]\d*))$/.exec(range ?? "");
  if (!match) return false;
  let actual;
  let declared;
  try {
    actual = parseSemver(version);
    declared = parseSemver(match[2]);
  } catch {
    return false;
  }
  if (!match[1]) return actual.every((part, index) => part === declared[index]);
  if (match[1] === "~")
    return actual[0] === declared[0] && actual[1] === declared[1] && actual[2] >= declared[2];
  if (declared[0] > 0) return actual[0] === declared[0] && compareVersion(actual, declared) >= 0;
  if (declared[1] > 0)
    return actual[0] === 0 && actual[1] === declared[1] && compareVersion(actual, declared) >= 0;
  return actual[0] === 0 && actual[1] === 0 && actual[2] === declared[2];
}
