import { validateGhcrPublicationWorkflow } from "../../../src/repository/metadata/validate-ghcr-publication-workflow.mjs";

const publish = `on:\n  push:\n    tags:\n      - 'v[0-9]*.[0-9]*.[0-9]*'\njobs:\n  publish:\n    environment: ghcr-publish\n    steps:\n      - uses: docker/build-push-action@v6`;

const validate = (text) =>
  validateGhcrPublicationWorkflow({
    existsSync: () => true,
    readFileSync: () => text,
  });

test("accepts a tagged GHCR publisher with its required environment and image push", () => {
  expect(validate(publish)).toEqual([]);
});

test("reports missing GHCR workflow safeguards", () => {
  expect(validate("on: []")).toEqual([
    "BLOCKED: GHCR workflow must trigger for numeric version tags.",
    "BLOCKED: GHCR workflow must contain a publish job.",
    "BLOCKED: GHCR publish job must use the ghcr-publish environment.",
    "BLOCKED: GHCR publish job must build and push its image with Docker.",
  ]);
});

test("accepts a quoted trigger key", () => {
  expect(validate(publish.replace("on:", '"on":'))).toEqual([]);
});

test("returns no findings when the workflow file is absent", () => {
  expect(validateGhcrPublicationWorkflow({ existsSync: () => false })).toEqual([]);
});
