import { validateGhcrRepository } from "./validate-repository.mjs";

export function parseGhcrRepository(repository) {
  return validateGhcrRepository(repository).split("/");
}
