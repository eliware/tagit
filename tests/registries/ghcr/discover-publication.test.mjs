import { publishesGhcr } from "../../../src/registries/ghcr/discover-publication.mjs";

test("detects the declared GHCR publication profile", () => {
  const fs = {
    existsSync: (file) => file === "package.json" || file === ".github/workflows/publish.yaml",
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
test("requires the publish workflow for the GHCR profile", () => {
  expect(
    publishesGhcr({
      existsSync: (file) => file === "package.json",
      readFileSync: () => JSON.stringify({ eliware: { apply: ["ghcr-published"] } }),
    }),
  ).toBe(false);
});
