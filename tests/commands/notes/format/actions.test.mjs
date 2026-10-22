import { formatNotesActions } from "../../../../src/commands/notes/format/actions.mjs";

test("formats the contributor action instructions", () => {
  expect(formatNotesActions()).toEqual(
    expect.arrayContaining([
      "AI ACTIONS",
      "1. Read the full diff.",
      "3. Update RELEASE_NOTES.md with short categories and the exact release version.",
      "5. Run tagit preflight after you update the notes and tests.",
      "The tagit command reads files and makes no changes. It does not change versions, commit, tag, or publish.",
    ]),
  );
});
