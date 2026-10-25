import { validateGhcrRepository } from "../../../../src/registries/ghcr/parse/validate-repository.mjs";

test("accepts a valid owner and image pair", () => {
  expect(validateGhcrRepository("eliware/tagit")).toBe("eliware/tagit");
});

test.each(["", "tagit", "eliware/", "/tagit", "eliware/tagit/extra"])(
  "rejects invalid GHCR repository %s",
  (repository) => {
    expect(() => validateGhcrRepository(repository)).toThrow("Invalid GHCR repository");
  },
);
