import { defineConfig } from "wxt";

export default defineConfig({
  srcDir: "src",
  manifest: {
    name: "Chat Vault",
    description:
      "Export AI chat conversations to durable JSON and Markdown formats. Privacy-first — zero network requests.",
    version: "1.0.0",
    permissions: ["activeTab", "downloads", "clipboardRead"],
    icons: {
      "16": "icons/icon-16.png",
      "48": "icons/icon-48.png",
      "128": "icons/icon-128.png",
    },
  },
});
