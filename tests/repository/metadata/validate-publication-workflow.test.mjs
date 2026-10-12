import { validatePublicationWorkflow } from "../../../src/repository/metadata/validate-publication-workflow.mjs";

const publication = `on:\n  push:\n    tags:\n      - 'v[0-9]*.[0-9]*.[0-9]*'\njobs:\n  publish:\n    needs: validate\n    steps:\n      - uses: actions/checkout@v6\n      - uses: actions/setup-node@v7\n      - run: npm -g install npm@latest\n      - run: npm ci\n      - run: npm publish --provenance\n    permissions:\n      id-token: write`;

function validatePublishWorkflow(text) {
  return validatePublicationWorkflow({
    existsSync: () => true,
    readFileSync: () => text,
  });
}

test("accepts a canonical publication workflow with a quoted trigger key", () => {
  expect(validatePublishWorkflow(publication.replace("on:", '"on":'))).toEqual([]);
});

test("reports every missing publication safeguard", () => {
  const failures = validatePublishWorkflow(
    "on:\n  push:\n    branches: [main]\njobs:\n  validate:\n    steps: []\n  publish:\n    steps:\n      - run: npm publish\n      - run: echo NODE_AUTH_TOKEN",
  );
  expect(failures).toHaveLength(9);
  expect(failures).toContain(
    "BLOCKED: publication workflow must trigger for numeric version tags.",
  );
  expect(failures).toContain(
    "BLOCKED: publication workflow must use Trusted Publishing without static npm tokens.",
  );
});

test("reports a missing publish job", () => {
  expect(
    validatePublishWorkflow(
      "on:\n  push:\n    tags:\n      - v[0-9]*.[0-9]*.[0-9]*\njobs:\n  validate:\n    steps: []",
    ),
  ).toContain("BLOCKED: publication workflow must contain a publish job.");
});

test("returns no findings when the publication workflow file is absent", () => {
  expect(validatePublicationWorkflow({ existsSync: () => false })).toEqual([]);
});
