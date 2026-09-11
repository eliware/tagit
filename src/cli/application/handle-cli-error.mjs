export function handleCliError(error, { log, exit, format = (value) => value }) {
  log.error(format(error));
  exit(1);
  throw error;
}
