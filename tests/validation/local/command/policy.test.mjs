import { validateTestCommand } from "../../../../src/validation/local/command/policy.mjs";

const fs = {
  existsSync: () => true,
  lstatSync: () => ({ isSymbolicLink: () => false }),
  readFileSync: (file) =>
    file === "node_modules/@eliware/test/package.json"
      ? JSON.stringify({ name: "@eliware/test", version: "3.5.0" })
      : "{}",
};

test("accepts the consumer command and the harness package command", () => {
  const consumer = {
    name: "demo",
    scripts: { test: "eliware-test" },
    devDependencies: { "@eliware/test": "^3.0.0" },
  };
  expect(validateTestCommand(consumer, fs)).toBe("valid");
  expect(
    validateTestCommand(
      { name: "@eliware/test", scripts: { test: "node bin/eliware-test.mjs" } },
      fs,
    ),
  ).toBe("valid");
});

test("rejects other test commands for consumer and harness packages", () => {
  const consumer = { name: "demo", devDependencies: { "@eliware/test": "^3.0.0" } };
  expect(
    validateTestCommand({ ...consumer, scripts: { test: "node bin/eliware-test.mjs" } }, fs),
  ).toBe("invalid");
  expect(validateTestCommand({ ...consumer, scripts: { test: "jest" } }, fs)).toBe("invalid");
  expect(
    validateTestCommand({ name: "@eliware/test", scripts: { test: "eliware-test" } }, fs),
  ).toBe("invalid");
});

test("reports missing scripts and unavailable harness packages", () => {
  expect(validateTestCommand({ scripts: {} }, fs)).toBe("missing");
  expect(validateTestCommand({ scripts: { test: "eliware-test" } }, fs)).toBe("invalid");
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
