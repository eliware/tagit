import { validateReleaseWorkflow } from "../../../src/repository/metadata/validate-workflow.mjs";

const valid = `on:\n  push:\n    branches:\n      - main\n  pull_request:\njobs:\n  test:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v6\n      - uses: actions/setup-node@v7\n      - run: npm -g install npm@latest\n      - run: npm ci\n      - run: npm test`;
const publish = `on:\n  push:\n    tags:\n      - 'v[0-9]*.[0-9]*.[0-9]*'\njobs:\n  publish:\n    needs: validate\n    steps:\n      - uses: actions/checkout@v6\n      - uses: actions/setup-node@v7\n      - run: npm -g install npm@latest\n      - run: npm ci\n      - run: npm publish --provenance\n    permissions:\n      id-token: write`;
const ghcrPublish = `on:\n  push:\n    tags:\n      - 'v[0-9]*.[0-9]*.[0-9]*'\njobs:\n  publish:\n    environment: ghcr-publish\n    steps:\n      - uses: docker/build-push-action@v6`;

function validateFiles(files, packageData) {
  return validateReleaseWorkflow(
    { existsSync: (path) => path in files, readFileSync: (path) => files[path] },
    packageData,
  );
}

test("does not require publication workflows for non-publishing packages", () => {
  expect(validateFiles({ ".github/workflows/ci.yaml": valid }, {})).toEqual([]);
  expect(validateReleaseWorkflow({ existsSync: () => false })).toEqual([]);
});

test("applies npm workflow checks to npm-published packages", () => {
  expect(
    validateFiles(
      { ".github/workflows/ci.yaml": valid, ".github/workflows/publish.yaml": publish },
      { eliware: { apply: ["npm-published"] } },
    ),
  ).toEqual([]);
});

test("applies npm publication policy to npm-published packages", () => {
  const incomplete = publish.replace(/      - run: npm[^\n]*\n/g, "");
  expect(
    validateFiles(
      { ".github/workflows/ci.yaml": valid, ".github/workflows/publish.yaml": incomplete },
      { eliware: { apply: ["npm-published"] } },
    ),
  ).toContain("BLOCKED: publication job must publish with npm provenance.");
});

test("reports missing publication workflow requirements", () => {
  expect(
    validateFiles(
      { ".github/workflows/ci.yaml": valid, ".github/workflows/publish.yaml": "jobs: {}" },
      { eliware: { apply: ["npm-published"] } },
    ),
  ).toContain("BLOCKED: publication workflow must trigger for numeric version tags.");
});

test("checks GHCR publication without requiring npm commands", () => {
  expect(
    validateFiles(
      { ".github/workflows/ci.yaml": valid, ".github/workflows/publish.yaml": ghcrPublish },
      { eliware: { apply: ["ghcr-published"] } },
    ),
  ).toEqual([]);
});
