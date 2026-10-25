import { showUpstreamInformation } from "./display.mjs";
import { selectInformationOption } from "../information-option.mjs";

const packageJsonUrl = new URL("../../../../package.json", import.meta.url);

export function dispatchUpstreamInformation(args, dependencies) {
  return showUpstreamInformation(selectInformationOption(args), dependencies, packageJsonUrl);
}
