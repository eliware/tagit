export default function reportNpmViewResult(log, status, exists) {
  const result = exists ? "available" : "not found";
  log.info?.(`${status}: ${result}.`);
}
