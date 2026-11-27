import { jest } from "@jest/globals";
import dispatchVersionQuery from "../../../../src/cli/application/dispatch/version.mjs";
import dispatchCommand from "../../../../src/cli/application/dispatch/command.mjs";

test("prints the installed version for a version query", () => {
  const output = jest.fn();
  expect(dispatchVersionQuery({ versionQuery: true }, { packageVersion: "1.2.3", output })).toBe(
    true,
  );
  expect(output).toHaveBeenCalledWith("1.2.3");
});

test("uses the console output when no output function is supplied", () => {
  const output = jest.spyOn(console, "log").mockImplementation(() => {});
  try {
    expect(dispatchVersionQuery({ versionQuery: true }, { packageVersion: "1.2.3" })).toBe(true);
    expect(output).toHaveBeenCalledWith("1.2.3");
  } finally {
    output.mockRestore();
  }
});

test("returns from command dispatch after printing the version", async () => {
  const output = jest.fn();
  await dispatchCommand({ versionQuery: true }, { packageVersion: "1.2.3", output });
  expect(output).toHaveBeenCalledWith("1.2.3");
});

test("leaves ordinary commands to the dispatcher", () => {
  const output = jest.fn();
  expect(dispatchVersionQuery({ versionQuery: false }, { packageVersion: "1.2.3", output })).toBe(
    false,
  );
  expect(output).not.toHaveBeenCalled();
});
