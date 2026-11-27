import path from "path";

export default function normalizeCliExecutableName(executablePath = "") {
  return executablePath ? path.basename(executablePath.replaceAll("\\", "/")) : "";
}
