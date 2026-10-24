import { jest } from "@jest/globals";
import { readGhcrPublication } from "../../../../src/registries/ghcr/publication/reader.mjs";

test("reads package metadata when both publication files exist", () => {
  const fs = {
    existsSync: () => true,
    readFileSync: () => JSON.stringify({ eliware: { apply: ["ghcr-published"] } }),
  };
  expect(readGhcrPublication(fs)).toEqual({ eliware: { apply: ["ghcr-published"] } });
});

test("does not read metadata when a required file is missing", () => {
  const readFileSync = jest.fn();
  expect(readGhcrPublication({ existsSync: () => false, readFileSync })).toBeNull();
  expect(readFileSync).not.toHaveBeenCalled();
});
