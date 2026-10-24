import { jest } from "@jest/globals";
import { selectRegistryPolicy } from "../../../../../src/commands/release-wait/verify/registry/policy.mjs";

const fsWithGhcr = (enabled) => ({
  existsSync: (file) =>
    file === "package.json" || (enabled && file === ".github/workflows/ghcr.yaml"),
  readFileSync: () => JSON.stringify({ eliware: { apply: ["ghcr-published"] } }),
});

test("selects npm and GHCR checks for applicable profiles", () => {
  const log = { info: jest.fn() };
  expect(
    selectRegistryPolicy(fsWithGhcr(true), log, {
      applicable: true,
      packageName: "demo",
      isPrivate: false,
    }),
  ).toEqual({ npm: true, ghcr: true });
  expect(log.info).not.toHaveBeenCalled();
});

test("reports when npm and GHCR checks do not apply", () => {
  const log = { info: jest.fn() };
  expect(
    selectRegistryPolicy(fsWithGhcr(false), log, {
      applicable: false,
      packageName: "demo",
      isPrivate: true,
    }),
  ).toEqual({ npm: false, ghcr: false });
  expect(log.info).toHaveBeenNthCalledWith(1, "npm verification: not applicable.");
  expect(log.info).toHaveBeenNthCalledWith(2, "GHCR verification: not applicable.");
});

test("uses a supplied GHCR profile decision without reading package metadata", () => {
  const log = { info: jest.fn() };
  expect(
    selectRegistryPolicy(
      { existsSync: jest.fn() },
      log,
      {
        applicable: false,
        packageName: null,
        isPrivate: false,
      },
      true,
    ),
  ).toEqual({ npm: false, ghcr: true });
  expect(log.info).toHaveBeenCalledWith("npm verification: not applicable.");
  expect(log.info).not.toHaveBeenCalledWith("GHCR verification: not applicable.");
});

test.each([
  [{ applicable: false, packageName: "demo", isPrivate: false }],
  [{ applicable: true, packageName: null, isPrivate: false }],
  [{ applicable: true, packageName: "demo", isPrivate: true }],
])("skips npm verification when the package does not qualify: %j", (target) => {
  expect(selectRegistryPolicy(fsWithGhcr(false), { info: jest.fn() }, target).npm).toBe(false);
});
