# Convention alignment

`@eliware/tagit` is aligned with the applicable Eliware conventions as of
2026-09-05.

| Area | Status | Evidence |
|---|---|---|
| Documentation structure | aligned | README, AGENTS.md, RELEASE_NOTES.md, docs/, specs/, examples/, and .env.example are present and linked. |
| Node and package conventions | aligned | Native ESM, Node.js >=26, explicit exports, allowlisted files, provenance, and synchronized lockfile. |
| Testing and CI | aligned | @eliware/test scripts, mirrored tests, 100x4 ownership in the shared harness, Ubuntu validation, optional Windows validation, and separate tag-only publication. |
| Release workflow | aligned | Owner notes/push/preflight boundary, explicit DevOps version, exact commit/tag checks, and publication verification. |
| Infrastructure | aligned | Knit deployment source is present and contains the validation command list; TagIt performs no deployment itself. |

This file records repository-local evidence. The organization-wide convention
tracker remains authoritative for cross-repository status.
