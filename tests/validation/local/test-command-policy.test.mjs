import {
  validateTestCommand,
  invokesEliwareTest,
} from "../../../src/validation/local/test-command-policy.mjs";

const fs = {
  existsSync: () => true,
  lstatSync: () => ({ isSymbolicLink: () => false }),
  readFileSync: (file) =>
    file === "node_modules/@eliware/test/package.json"
      ? JSON.stringify({ name: "@eliware/test", version: "3.5.0" })
      : "{}",
};

test("accepts the required consumer command and supported harness wrappers", () => {
  const consumer = {
    name: "demo",
    scripts: { test: "eliware-test" },
    devDependencies: { "@eliware/test": "^3.0.0" },
  };
  expect(validateTestCommand(consumer, fs)).toBe("valid");
  expect(invokesEliwareTest("eliware-test")).toBe(true);
  expect(invokesEliwareTest("node bin/eliware-test.mjs")).toBe(true);
  expect(
    validateTestCommand(
      { name: "@eliware/test", scripts: { test: "node bin/eliware-test.mjs" } },
      fs,
    ),
  ).toBe("valid");
});

test("rejects consumer wrappers and unrelated test commands", () => {
  const consumer = { name: "demo", devDependencies: { "@eliware/test": "^3.0.0" } };
  expect(
    validateTestCommand({ ...consumer, scripts: { test: "node bin/eliware-test.mjs" } }, fs),
  ).toBe("invalid");
  expect(validateTestCommand({ ...consumer, scripts: { test: "jest" } }, fs)).toBe("invalid");
  expect(invokesEliwareTest("jest")).toBe(false);
});

test("reports missing scripts and unavailable harness packages", () => {
  expect(validateTestCommand({ scripts: {} }, fs)).toBe("missing");
  expect(
    validateTestCommand(
      {
        name: "demo",
        scripts: { test: "eliware-test" },
        devDependencies: { "@eliware/test": "^3.0.0" },
      },
      { existsSync: () => false },
    ),
  ).toBe("invalid");
});
