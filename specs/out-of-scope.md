# Out of scope and unintended behavior

The following are intentionally not Tagit responsibilities:

- authenticating users or proving that an operator belongs to DevOps;
- enforcing project-owner versus DevOps command policy;
- choosing or automatically bumping a release version;
- rewriting package metadata or release files during release;
- creating release branches;
- staging unrelated or untracked files;
- rerunning checks already owned by the shared `npm test` harness;
- replacing CI with local validation;
- publishing or deploying application workloads directly;
- changing GitOps repositories, infrastructure, or production state;
- updating GitOps version pins, image tags, digests, overlays, or deployment
  manifests;
- deleting or moving remote release tags to recover from an interrupted release;
- supporting arbitrary YAML templating or every possible container-image layout;
- treating internal source modules as a stable programmatic API; and
- using coverage as a substitute for smoke, integration, regression, or E2E
  tests when those checks apply.

These boundaries are deliberate. A request that requires a change outside them
belongs in the owning project, shared harness, GitOps repository, or operations
process rather than in Tagit.

## Intentional implementation boundaries

These implementation choices are also deliberate and should not be treated as
missing general-purpose support:

- GHCR verification is limited to organization-owned, repository-named images
  using `vX.Y.Z` tags. Registry ownership is enforced by GHCR and workflow
  policy; callers provide the consumer repository identity.
- GitHub run and job records are checked against the documented response shape.
  Malformed records are reported as actionable validation failures rather than
  being silently trusted or discarded.
- CI polling is bounded and synchronous because the release CLI needs a
  cancellation-safe polling primitive.
- The newest exact-tag, exact-HEAD workflow run is authoritative. Workflow
  identity is not independently inferred when the exact tag and commit match.
- Command dispatch keeps injectable dependencies as its stable test seam, and
  command-before-options validation remains explicit to preserve diagnostics.
- Validation output redaction covers known command-output credential formats;
  arbitrary plaintext secret detection belongs to repository and CI policy.
- An empty CI run list after a push means the workflow has not appeared yet and
  is handled as a bounded wait condition.
