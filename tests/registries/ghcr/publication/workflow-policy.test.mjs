import { jest } from "@jest/globals";
import { hasGhcrPublicationWorkflow } from "../../../../src/registries/ghcr/publication/workflow-policy.mjs";

test("checks for the canonical GHCR publication workflow", () => {
  const existsSync = jest.fn(() => true);
  expect(hasGhcrPublicationWorkflow({ existsSync })).toBe(true);
  expect(existsSync).toHaveBeenCalledWith(".github/workflows/ghcr.yaml");
});

test("returns false when the GHCR publication workflow is absent", () => {
  expect(hasGhcrPublicationWorkflow({ existsSync: () => false })).toBe(false);
});
