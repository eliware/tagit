export function isReleaseCiFailure(details) {
  return details.status === "completed" && details.conclusion !== "success";
}
