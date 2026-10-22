import { evaluateReleasePolicy } from "../../../src/commands/release/policy.mjs";

const fsWithPackageVersion = (version) => ({
  existsSync: (file) => file === "package.json",
  readFileSync: () => JSON.stringify({ version }),
});

test("skips template repositories before package version checks", () => {
  const fs = { existsSync: (file) => file === ".notag" };
  expect(evaluateReleasePolicy(fs, { version: "1.2.3", dryRun: false })).toBe("template");
});

test("validates the version before a dry run", () => {
  expect(
    evaluateReleasePolicy(fsWithPackageVersion("1.2.3"), { version: "1.2.3", dryRun: true }),
  ).toBe("dry-run");
  expect(() =>
    evaluateReleasePolicy(fsWithPackageVersion("1.2.2"), { version: "1.2.3", dryRun: true }),
  ).toThrow("does not match");
});

test("allows a version-matched release", () => {
  expect(evaluateReleasePolicy(fsWithPackageVersion("1.2.3"), { version: "1.2.3" })).toBeNull();
});
