import { npmViewHasVersion } from "../../view-response.mjs";

export function classifyNpmViewResult(output, version) {
  return npmViewHasVersion(output, version) ? "available" : "not-found";
}
