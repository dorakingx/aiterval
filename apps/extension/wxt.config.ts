import { defineConfig } from "wxt";

export default defineConfig({
  modules: ["@wxt-dev/module-react"],
  manifest: {
    name: "AIterval — English in AI wait time",
    description: "Turn AI waiting time into short English listening practice.",
    version: "0.2.0",
    permissions: ["storage", "activeTab", "scripting", "contextMenus"],
    host_permissions: [
      "https://chatgpt.com/*",
      "https://claude.ai/*",
      "https://gemini.google.com/*",
    ],
    icons: {
      16: "icon/16.png",
      32: "icon/32.png",
      48: "icon/48.png",
      128: "icon/128.png",
    },
    action: {
      default_title: "AIterval",
      default_icon: { 16: "icon/16.png", 32: "icon/32.png" },
    },
    options_ui: { page: "options.html", open_in_tab: true },
    commands: {
      "start-sprint": {
        suggested_key: { default: "Ctrl+Shift+L", mac: "Command+Shift+L" },
        description: "Start a Listening Sprint",
      },
    },
    content_security_policy: {
      extension_pages:
        "script-src 'self'; object-src 'none'; base-uri 'self'; connect-src 'self'",
    },
    web_accessible_resources: [
      { resources: ["icon/*"], matches: ["<all_urls>"] },
    ],
  },
});
