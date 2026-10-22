export function npmViewHasVersion(output, version) {
  const value = JSON.parse(output);
  return Array.isArray(value) ? value.length === 1 && value[0] === version : value === version;
}
