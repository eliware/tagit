# GitOps and publication behavior

Tagit can verify package and container publication when the target project's
workflow declares those outputs. It does not deploy applications, modify
production infrastructure, or update GitOps version pins.

## npm

For public packages, post-release verification checks that the requested version
is visible and that expected distribution metadata is present. Registry
propagation delays are retried within a bounded window.

## GHCR

GHCR verification supports the documented Eliware convention of an
organization-owned, repository-named image with a version tag and expected
digest. Unsupported image layouts are outside this package's verification
contract.

## GitOps

Deployable consumer projects use the organization's GitOps staging repository
and pull-request workflow. GitOps owns deployment, rollout, infrastructure
state, and all version-pin updates. Tagit does not read or edit GitOps
repositories or perform automatic deployment.
