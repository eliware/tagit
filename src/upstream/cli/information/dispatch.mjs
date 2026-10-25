import { showUpstreamInformation } from "./display.mjs";
import { selectInformationOption } from "../information-option.mjs";

export function dispatchUpstreamInformation(args, dependencies) {
  return showUpstreamInformation(selectInformationOption(args), dependencies);
}
