import { jest } from "@jest/globals";
import { checkNpmPublicationAttempt } from "../../../src/registries/npm/poll-publication.mjs";

test("checks one npm visibility attempt", async () => {
  const exec = jest.fn((_command, _args, _options, callback) => callback(null, '"1.2.0"', ""));
  const log = { info: jest.fn() };
  await expect(
    checkNpmPublicationAttempt(exec, log, {
      packageName: "demo",
      version: "1.2.0",
      command: { executable: "npm", args: [], options: {} },
      attempt: 0,
      retries: 1,
    }),
  ).resolves.toBe(true);
  expect(log.info).toHaveBeenCalledWith("npm view demo@1.2.0 (1/1): available.");
});

test("reports one failed npm visibility attempt", async () => {
  const exec = jest.fn((_command, _args, _options, callback) =>
    callback({ code: "EAI_AGAIN" }, "", ""),
  );
  const log = { info: jest.fn() };
  await expect(
    checkNpmPublicationAttempt(exec, log, {
      packageName: "demo",
      version: "1.2.0",
      command: { executable: "npm", args: [], options: {} },
      attempt: 0,
      retries: 1,
    }),
  ).resolves.toBe(false);
  expect(log.info).toHaveBeenCalledWith("npm view demo@1.2.0 (1/1): failed (EAI_AGAIN).");
});
