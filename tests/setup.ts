import { fakeBrowser } from "@webext-core/fake-browser";

// Make fake browser APIs available globally in tests
Object.assign(globalThis, { chrome: fakeBrowser, browser: fakeBrowser });
