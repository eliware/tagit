import { jest } from "@jest/globals";
import { readPackageData } from "../../../../src/commands/release-wait/read/package-data.mjs";

test("reads and parses package metadata", () => {
  const fs = {
    existsSync: jest.fn(() => true),
    readFileSync: jest.fn(() => '{"name":"demo"}'),
  };

  expect(readPackageData(fs)).toEqual({ name: "demo" });
  expect(fs.readFileSync).toHaveBeenCalledWith("package.json", "utf8");
});

test("returns null when package metadata is absent", () => {
  const fs = { existsSync: jest.fn(() => false), readFileSync: jest.fn() };

  expect(readPackageData(fs)).toBeNull();
  expect(fs.readFileSync).not.toHaveBeenCalled();
});
