export function parseGhcrRepository(repository) {
  const part = /^[A-Za-z0-9](?:[A-Za-z0-9_.-]*[A-Za-z0-9])?$/;
  if (!repository || repository.split('/').length !== 2 || repository.split('/').some((value) => !part.test(value)))
    throw new Error(`Invalid GHCR repository: ${repository}`);
  return repository.split('/');
}
