import { validateNpmPublicationJob } from "../../../src/repository/metadata/validate-npm-publication-workflow.mjs";

const valid = [
  "      - run: npm -g install npm@latest",
  "      - run: npm ci",
  "      - run: npm publish --provenance",
  "    permissions:",
  "      id-token: write",
];

test("accepts a valid npm publication job", () => {
  expect(validateNpmPublicationJob(valid)).toEqual([]);
});

test("reports missing npm publication safeguards and static tokens", () => {
  expect(validateNpmPublicationJob(["      - run: echo NODE_AUTH_TOKEN"])).toEqual([
    "BLOCKED: publication job must install npm@latest before npm ci.",
    "BLOCKED: publication job must run npm ci.",
    "BLOCKED: publication job must publish with npm provenance.",
    "BLOCKED: publication workflow must use Trusted Publishing without static npm tokens.",
    "BLOCKED: publication job must grant id-token: write.",
  ]);
});
