import { jest } from "@jest/globals";
import { readRepositoryName } from "../../../src/repository/repository-name/read-repository-name.mjs";

test.each(["https://github.com/eliware/tagit.git\n", "git@github.com:eliware/tagit.git"])(
  "reads the owner and repository from a GitHub origin remote: %s",
  (remote) => {
    expect(readRepositoryName(jest.fn(() => remote))).toBe("eliware/tagit");
  },
);

test.each(["not-a-repository", "https://gitlab.com/eliware/tagit.git"])(
  "rejects a remote that is not a GitHub repository: %s",
  (remote) => {
    expect(() => readRepositoryName(jest.fn(() => remote))).toThrow(
      "Cannot determine the GitHub repository",
    );
  },
);
