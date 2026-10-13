import { validateCiWorkflow } from "../../../src/repository/metadata/validate-ci-workflow.mjs";

const valid = `on:\n  push:\n    branches:\n      - main\n  pull_request:\njobs:\n  test:\n    steps:\n      - uses: actions/checkout@v6\n      - uses: actions/setup-node@v7\n      - run: npm -g install npm@latest\n      - run: npm ci\n      - run: npm test`;

const validate = (text) => validateCiWorkflow({ existsSync: () => true, readFileSync: () => text });

test("accepts CI with required triggers, tools, and commands", () => {
  expect(validate(valid)).toEqual([]);
});

test("reports missing CI requirements", () => {
  const failures = validate("on:\n  push:\n    branches: [release]\njobs: {}");
  expect(failures).toContain("BLOCKED: release workflow must run npm ci.");
  expect(failures).toContain("BLOCKED: release workflow must run npm test.");
  expect(failures).toContain("BLOCKED: CI workflow must run on pushes to main.");
  expect(failures).toContain("BLOCKED: CI workflow must run on pull requests.");
  expect(failures).toContain("BLOCKED: CI workflow must check out the repository.");
  expect(failures).toContain("BLOCKED: CI workflow must use actions/setup-node@v7.");
  expect(failures).toContain("BLOCKED: CI workflow must install npm@latest before npm ci.");
});

test("returns null when the CI workflow is absent", () => {
  expect(validateCiWorkflow({ existsSync: () => false })).toBeNull();
});

test("accepts a quoted CI workflow trigger key", () => {
  expect(validate(valid.replace("on:", '"on":'))).toEqual([]);
});
