export function readNpmErrorDetail(error) {
  return String(error.stderr ?? error.stdout ?? error.message ?? "");
}
