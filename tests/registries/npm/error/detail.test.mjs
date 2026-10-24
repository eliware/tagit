import { readNpmErrorDetail } from "../../../../src/registries/npm/error/detail.mjs";

test("prefers stderr over stdout and message", () => {
  expect(readNpmErrorDetail({ stderr: "stderr", stdout: "stdout", message: "message" })).toBe(
    "stderr",
  );
});

test("uses stdout when stderr is absent", () => {
  expect(readNpmErrorDetail({ stderr: null, stdout: "stdout", message: "message" })).toBe("stdout");
});

test("uses the message when stderr and stdout are absent", () => {
  expect(readNpmErrorDetail({ stderr: null, stdout: undefined, message: "message" })).toBe(
    "message",
  );
});

test("returns an empty detail when no error text exists", () => {
  expect(readNpmErrorDetail({})).toBe("");
});
