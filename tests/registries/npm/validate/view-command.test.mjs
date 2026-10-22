import { validateNpmViewCommandInputs } from "../../../../src/registries/npm/validate/view-command.mjs";

test.each([
  ["demo", "1.0.0"],
  ["@eliware/test", "0.1.2"],
])("accepts npm package and version inputs %s %s", (packageName, version) => {
  expect(() => validateNpmViewCommandInputs(packageName, version)).not.toThrow();
});

test.each([
  ["demo & whoami", "1.0.0", "Package name is invalid"],
  ["demo", "1.0.0 & whoami", "Version is invalid"],
  [undefined, "1.0.0", "Package name is invalid"],
  ["demo", undefined, "Version is invalid"],
])("rejects invalid npm package and version inputs", (packageName, version, message) => {
  expect(() => validateNpmViewCommandInputs(packageName, version)).toThrow(message);
});
