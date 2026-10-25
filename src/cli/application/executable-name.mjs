import path from "path";

export function normalizeCliExecutableName(executablePath = "") {
  return executablePath ? path.basename(executablePath.replaceAll("\\", "/")) : "";
}
