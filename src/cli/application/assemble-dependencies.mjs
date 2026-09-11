import { defaultDependencies } from './default-dependencies.mjs';

export function assembleDependencies(overrides = {}) {
  return { ...defaultDependencies(), ...overrides };
}
