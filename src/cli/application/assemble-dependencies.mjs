import defaultDependencies from "./default-dependencies.mjs";

export default function assembleDependencies(overrides = {}) {
  return { ...defaultDependencies(), ...overrides };
}
