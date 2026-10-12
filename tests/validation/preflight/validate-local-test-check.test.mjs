import { jest } from "@jest/globals";
import { validateLocalTestCheck } from "../../../src/validation/preflight/validate-local-test-check.mjs";

test("builds the authoritative shared-harness check with requested waivers", () => {
  const fs = {
    existsSync: jest.fn(() => true),
    lstatSync: jest.fn(() => ({ isSymbolicLink: () => false })),
    readFileSync: jest.fn((file) =>
      JSON.stringify(
        file === "node_modules/@eliware/test/package.json"
          ? { name: "@eliware/test", version: "1.1.0" }
          : {
              name: "demo",
              scripts: { test: "eliware-test" },
              devDependencies: { "@eliware/test": "^1.0.0" },
            },
      ),
    ),
  };
  expect(validateLocalTestCheck(fs, { ignore100x4: true }).check[1][1]).toContain("--ignore-100x4");
});
