import ownerGuidance from "../../src/policy/owner-guidance.mjs";

test("states the owner and DevOps command boundary", () => {
  expect(ownerGuidance).toContain("Project owners may run only");
  expect(ownerGuidance).toContain("DevOps runs those commands");
  expect(ownerGuidance).not.toContain("waiver");
  expect(ownerGuidance).not.toContain("--ignore-100x4");
});
