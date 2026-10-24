import { jest } from "@jest/globals";
import { finalizeGhcrPublication } from "../../../../src/registries/ghcr/verify/finalize-publication.mjs";

const digest = `sha256:${"a".repeat(64)}`;

test("validates and reports a verified GHCR image digest", () => {
  const log = { info: jest.fn() };
  expect(finalizeGhcrPublication(log, "eliware/demo", "1.0.0", digest, { name: digest })).toEqual({
    imageDigest: digest,
  });
  expect(log.info).toHaveBeenCalledWith("GHCR verified: eliware/demo:1.0.0.");
  expect(log.info).toHaveBeenCalledWith(`GHCR digest: ${digest}`);
});

test("reports verified publication without a digest when none is available", () => {
  const log = { info: jest.fn() };
  expect(finalizeGhcrPublication(log, "eliware/demo", "1.0.0", null, {})).toEqual({
    imageDigest: null,
  });
  expect(log.info).toHaveBeenCalledTimes(1);
});

test("rejects an unexpected digest before reporting success", () => {
  const log = { info: jest.fn() };
  expect(() =>
    finalizeGhcrPublication(log, "eliware/demo", "1.0.0", `sha256:${"b".repeat(64)}`, {
      name: digest,
    }),
  ).toThrow("digest mismatch");
  expect(log.info).not.toHaveBeenCalled();
});
