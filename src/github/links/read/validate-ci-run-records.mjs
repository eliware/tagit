export function validateCiRunRecords(runs) {
  if (!Array.isArray(runs)) throw new Error("GitHub CI link response must be an array.");
  const malformed = runs.filter(
    (run) =>
      !run ||
      typeof run !== "object" ||
      !Number.isInteger(run.databaseId) ||
      typeof run.headSha !== "string" ||
      typeof run.url !== "string",
  );
  if (malformed.length)
    throw new Error(`GitHub CI link response contains malformed run records: ${malformed.length}.`);
  return runs;
}
