import { validateReleaseWorkflow } from "../../../src/repository/metadata/validate-workflow.mjs";

const valid = `on:\n  push:\n    branches:\n      - main\n  pull_request:\njobs:\n  test:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v6\n      - uses: actions/setup-node@v7\n      - run: npm -g install npm@latest\n      - run: npm ci\n      - run: npm test`;
const publish = `on:\n  push:\n    tags:\n      - 'v[0-9]*.[0-9]*.[0-9]*'\njobs:\n  publish:\n    needs: validate\n    steps:\n      - uses: actions/checkout@v6\n      - uses: actions/setup-node@v7\n      - run: npm -g install npm@latest\n      - run: npm ci\n      - run: npm publish --provenance\n    permissions:\n      id-token: write`;

test("accepts a gated tag-only publication workflow", () => {
  expect(validateReleaseWorkflow({ existsSync: () => true, readFileSync: () => valid })).toEqual(
    [],
  );
});

test("reports missing validation and publication safeguards", () => {
  const failures = validateReleaseWorkflow({
    existsSync: () => true,
    readFileSync: () => "jobs:\n  publish:\n    run: npm publish",
  });
  expect(failures.length).toBeGreaterThan(1);
  expect(failures.join("\n")).toContain("npm test");
});

test("does not confuse a workflow push trigger with publication on branches", () => {
  expect(
    validateReleaseWorkflow({
      existsSync: () => true,
      readFileSync: () => valid.replace("- main", "- release"),
    }),
  ).toContain("BLOCKED: CI workflow must run on pushes to main.");
});

test("accepts the canonical validate job name", () => {
  const files = {
    ".github/workflows/ci.yaml": valid,
    ".github/workflows/publish.yaml": publish,
  };
  expect(
    validateReleaseWorkflow(
      { existsSync: (path) => path in files, readFileSync: (path) => files[path] },
      { eliware: { apply: ["npm-published"] } },
    ),
  ).toEqual([]);
});

test("does not require publication workflow for non-publishing packages or missing CI", () => {
  expect(validateReleaseWorkflow({ existsSync: () => false })).toEqual([]);
  expect(validateReleaseWorkflow({ existsSync: () => true, readFileSync: () => valid })).toEqual(
    [],
  );
});

test("reports each missing publication safeguard", () => {
  const files = {
    ".github/workflows/ci.yaml": valid,
    ".github/workflows/publish.yaml":
      "on:\n  push:\n    branches: [main]\njobs:\n  validate:\n    steps: []\n  publish:\n    steps:\n      - run: npm publish\n      - run: echo NODE_AUTH_TOKEN",
  };
  const failures = validateReleaseWorkflow(
    { existsSync: (path) => path in files, readFileSync: (path) => files[path] },
    { eliware: { apply: ["npm-published"] } },
  );
  expect(failures).toHaveLength(9);
});

test("reports an absent publication job", () => {
  const files = {
    ".github/workflows/ci.yaml": valid,
    ".github/workflows/publish.yaml":
      "on:\n  push:\n    tags:\n      - v[0-9]*.[0-9]*.[0-9]*\njobs:\n  validate:\n    steps: []",
  };
  expect(
    validateReleaseWorkflow(
      { existsSync: (path) => path in files, readFileSync: (path) => files[path] },
      { eliware: { apply: ["ghcr-published"] } },
    ),
  ).toContain("BLOCKED: publication workflow must contain a publish job.");
});

test("accepts a missing separate publish file as a later required-file validation", () => {
  expect(
    validateReleaseWorkflow(
      { existsSync: (path) => path === ".github/workflows/ci.yaml", readFileSync: () => valid },
      { eliware: { apply: ["npm-published"] } },
    ),
  ).toEqual([]);
});

test("supports quoted YAML trigger keys and missing workflow sections", () => {
  const files = {
    ".github/workflows/ci.yaml": valid,
    ".github/workflows/publish.yaml":
      '"on":\n  push:\n    tags:\n      - v[0-9]*.[0-9]*.[0-9]*\njobs:\n  publish:\n    needs: validate\n    steps:\n      - uses: actions/checkout@v6\n      - uses: actions/setup-node@v7\n      - run: npm -g install npm@latest\n      - run: npm ci\n      - run: npm publish --provenance\n    permissions:\n      id-token: write',
  };
  expect(
    validateReleaseWorkflow(
      { existsSync: (path) => path in files, readFileSync: (path) => files[path] },
      { eliware: { apply: ["npm-published"] } },
    ),
  ).toEqual([]);
  expect(
    validateReleaseWorkflow(
      {
        existsSync: (path) => path === ".github/workflows/ci.yaml" || path.endsWith("publish.yaml"),
        readFileSync: (path) => (path.endsWith("ci.yaml") ? valid : "on: []"),
      },
      { eliware: { apply: ["npm-published"] } },
    ),
  ).toContain("BLOCKED: publication workflow must trigger for numeric version tags.");
});
