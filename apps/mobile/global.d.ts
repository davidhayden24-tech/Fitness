// react-native-iap's package.json "react-native" export condition points
// tsc at its raw TS source (not its shipped .d.ts), which references the
// Node.js-style `global` object that React Native's runtime also exposes
// but that our tsconfig (DOM + ESNext libs, no @types/node) doesn't
// declare. This is enough for tsc to resolve that one reference - it isn't
// meant to be a general Node typings shim.
declare const global: typeof globalThis;
