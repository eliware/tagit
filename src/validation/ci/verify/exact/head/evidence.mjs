import selectLatestRun from "../../../select/run.mjs";
import selectCiCandidate from "../../../select/ci-candidate.mjs";
import selectPendingRun from "../../../select/pending-run.mjs";
import validateCompletedConclusion from "../../../validate/completed-conclusion.mjs";

export default function selectExactHeadEvidence(runs, headSha) {
  validateCompletedConclusion(selectLatestRun(runs, headSha));
  return {
    candidates: selectCiCandidate(runs, headSha),
    pending: selectPendingRun(runs, headSha),
  };
}
