/**
 * Lightweight logger wrapper that avoids direct console usage in application code.
 */

const runtimeConsole = globalThis.console;

export function logInfo(...args) {
  runtimeConsole?.log?.(...args);
}

export function logWarn(...args) {
  runtimeConsole?.warn?.(...args);
}

export function logError(...args) {
  runtimeConsole?.error?.(...args);
}
