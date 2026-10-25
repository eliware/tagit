export function classifyNpmViewAvailability(response, version) {
  const available = Array.isArray(response)
    ? response.length === 1 && response[0] === version
    : response === version;
  return available ? "available" : "not-found";
}
