export function registerLifecycle(deps) {
  deps.registerHandlersFn({ log: deps.log });
  deps.registerSignalsFn({ log: deps.log });
}
