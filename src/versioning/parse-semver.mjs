export function parseSemver(version, label = "version") {
  if (typeof version !== "string" || !/^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/.test(version))
    throw new Error(`Invalid ${label}: ${version}`);
  const parts = version.split(".").map(Number);
  if (!parts.every(Number.isSafeInteger)) throw new Error(`Invalid ${label}: ${version}`);
  return parts;
}
