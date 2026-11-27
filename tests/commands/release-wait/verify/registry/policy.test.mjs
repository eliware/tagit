import { jest } from "@jest/globals";
import selectRegistryPolicy from "../../../../../src/commands/release-wait/verify/registry/policy.mjs";

const fsWithGhcr = (enabled) => ({
  existsSync: (file) =>
    file === "package.json" || (enabled && file === ".github/workflows/ghcr.yaml"),
  readFileSync: () => JSON.stringify({ eliware: { apply: ["ghcr-published"] } }),
});

test("selects npm and GHCR checks for applicable profiles", () => {
  const log = { info: jest.fn() };
  expect(
    selectRegistryPolicy({
      fs: fsWithGhcr(true),
      log,
      applicable: true,
      packageName: "demo",
      isPrivate: false,
    }),
  ).toMatchObject({ npm: true, ghcr: true });
  expect(log.info).not.toHaveBeenCalled();
});

test("reports when npm and GHCR checks do not apply", () => {
  const log = { info: jest.fn() };
  expect(
    selectRegistryPolicy({
      fs: fsWithGhcr(false),
      log,
      applicable: false,
      packageName: "demo",
      isPrivate: true,
    }),
  ).toMatchObject({ npm: false, ghcr: false });
  expect(log.info).toHaveBeenNthCalledWith(1, "npm verification: not applicable.");
  expect(log.info).toHaveBeenNthCalledWith(2, "GHCR verification: not applicable.");
});

test("does not trust a stale GHCR profile decision when discovery no longer applies", () => {
  const log = { info: jest.fn() };
  expect(
    selectRegistryPolicy({
      fs: fsWithGhcr(false),
      log,
      applicable: false,
      packageName: null,
      isPrivate: false,
      ghcrApplicable: true,
    }),
  ).toMatchObject({ npm: false, ghcr: false });
  expect(log.info).toHaveBeenCalledWith("npm verification: not applicable.");
  expect(log.info).toHaveBeenCalledWith("GHCR verification: not applicable.");
});

test("uses current GHCR discovery when the supplied decision is stale", () => {
  expect(
    selectRegistryPolicy({
      fs: fsWithGhcr(true),
      log: { info: jest.fn() },
      applicable: false,
      packageName: null,
      isPrivate: false,
      ghcrApplicable: false,
    }).ghcr,
  ).toBe(true);
});

test.each([
  [{ applicable: false, packageName: "demo", isPrivate: false }],
  [{ applicable: true, packageName: null, isPrivate: false }],
  [{ applicable: true, packageName: "demo", isPrivate: true }],
])("skips npm verification when the package does not qualify: %j", (target) => {
  expect(
    selectRegistryPolicy({ fs: fsWithGhcr(false), log: { info: jest.fn() }, ...target }).npm,
  ).toBe(false);
});
