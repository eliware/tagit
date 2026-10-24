import { jest } from "@jest/globals";
import { publishesGhcr } from "../../../src/registries/ghcr/discover-publication.mjs";

test("detects the declared GHCR publication profile", () => {
  const fs = {
    existsSync: (file) => file === "package.json" || file === ".github/workflows/ghcr.yaml",
    readFileSync: () => JSON.stringify({ eliware: { apply: ["ghcr-published"] } }),
  };
  expect(publishesGhcr(fs)).toBe(true);
});
test("ignores GHCR text unless the package declares the profile", () => {
  expect(publishesGhcr({ existsSync: () => false })).toBe(false);
  expect(
    publishesGhcr({
      existsSync: () => true,
      readFileSync: () => JSON.stringify({ description: "See ghcr.io/eliware/demo" }),
    }),
  ).toBe(false);
});
test("requires ghcr.yaml for the GHCR profile", () => {
  const existsSync = jest.fn((file) => file === "package.json");
  expect(
    publishesGhcr({
      existsSync,
      readFileSync: () => JSON.stringify({ eliware: { apply: ["ghcr-published"] } }),
    }),
  ).toBe(false);
  expect(existsSync).toHaveBeenCalledWith(".github/workflows/ghcr.yaml");
});
