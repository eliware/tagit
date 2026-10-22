import { jest } from "@jest/globals";
import { reportGhcrPublication } from "../../../../src/registries/ghcr/verify/report-publication.mjs";

test("reports publication success and the image digest", () => {
  const log = { info: jest.fn() };
  reportGhcrPublication(log, "eliware/tagit", "1.2.3", "sha256:abc");
  expect(log.info.mock.calls).toEqual([
    ["GHCR verified: eliware/tagit:1.2.3."],
    ["GHCR digest: sha256:abc"],
  ]);
});

test("omits digest output when the image has no digest", () => {
  const log = { info: jest.fn() };
  reportGhcrPublication(log, "eliware/tagit", "1.2.3", null);
  expect(log.info.mock.calls).toEqual([["GHCR verified: eliware/tagit:1.2.3."]]);
});
