import validateGhcrRepository from "./validate-repository.mjs";

export default function parseGhcrRepository(repository) {
  return validateGhcrRepository(repository).split("/");
}
