import { validateNpmPublicationWorkflow } from "../../../src/repository/metadata/validate-npm-publication-workflow.mjs";

const valid = `on:\n  push:\n    tags:\n      - 'v[0-9]*.[0-9]*.[0-9]*'\njobs:\n  publish:\n    steps:\n      - run: npm -g install npm@latest\n      - run: npm ci\n      - run: npm publish --provenance\n    permissions:\n      id-token: write`;
const validate = (text) =>
  validateNpmPublicationWorkflow({
    existsSync: () => true,
    readFileSync: () => text,
  });

test("accepts a valid npm publication workflow", () => {
  expect(validate(valid)).toEqual([]);
});

test("reports missing npm publication safeguards and static tokens", () => {
  expect(validate("jobs:\n  publish:\n    steps:\n      - run: echo NODE_AUTH_TOKEN")).toEqual([
    "BLOCKED: publication job must install npm@latest before npm ci.",
    "BLOCKED: publication job must run npm ci.",
    "BLOCKED: publication job must publish with npm provenance.",
    "BLOCKED: publication workflow must use Trusted Publishing without static npm tokens.",
    "BLOCKED: publication job must grant id-token: write.",
  ]);
});

test("returns no findings when the publication workflow file is absent", () => {
  expect(validateNpmPublicationWorkflow({ existsSync: () => false })).toEqual([]);
});
