import { validateReleaseWorkflow } from "../../../src/repository/metadata/validate-workflow.mjs";

const valid = `on:\n  push:\n    branches:\n      - main\n  pull_request:\njobs:\n  test:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v6\n      - uses: actions/setup-node@v7\n      - run: npm -g install npm@latest\n      - run: npm ci\n      - run: npm test`;
const publish = `on:\n  push:\n    tags:\n      - 'v[0-9]*.[0-9]*.[0-9]*'\njobs:\n  publish:\n    needs: validate\n    steps:\n      - uses: actions/checkout@v6\n      - uses: actions/setup-node@v7\n      - run: npm -g install npm@latest\n      - run: npm ci\n      - run: npm publish --provenance\n    permissions:\n      id-token: write`;
const ghcrPublish = `on:\n  push:\n    tags:\n      - 'v[0-9]*.[0-9]*.[0-9]*'\njobs:\n  publish:\n    environment: ghcr-publish\n    steps:\n      - uses: docker/build-push-action@v6`;

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

test("accepts a quoted CI workflow trigger key", () => {
  expect(
    validateReleaseWorkflow({
      existsSync: () => true,
      readFileSync: () => valid.replace("on:", '"on":'),
    }),
  ).toEqual([]);
});

test("reports a missing publication trigger", () => {
  const files = {
    ".github/workflows/ci.yaml": valid,
    ".github/workflows/publish.yaml": "on: []",
  };
  expect(
    validateReleaseWorkflow(
      { existsSync: (path) => path in files, readFileSync: (path) => files[path] },
      { eliware: { apply: ["npm-published"] } },
    ),
  ).toContain("BLOCKED: publication workflow must trigger for numeric version tags.");
});

test("checks GHCR publication without requiring npm commands", () => {
  const files = {
    ".github/workflows/ci.yaml": valid,
    ".github/workflows/publish.yaml": ghcrPublish,
  };
  expect(
    validateReleaseWorkflow(
      { existsSync: (path) => path in files, readFileSync: (path) => files[path] },
      { eliware: { apply: ["ghcr-published"] } },
    ),
  ).toEqual([]);
});

test("keeps npm checks for npm-only packages", () => {
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
