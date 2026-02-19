export const SAFETY_LIMITS = {
	MAX_TURNS: 500,
	MAX_SCROLL_ITERATIONS: 100,
	MAX_EXTRACTION_TIME_MS: 60_000,
	MAX_CLIPBOARD_WAIT_MS: 2_000,
	MAX_SINGLE_TURN_SIZE: 100_000,
	SCROLL_STABILITY_THRESHOLD: 3,
	CLIPBOARD_READ_DELAY_MS: 175,
	SCROLL_STEP_DELAY_MS: 300,
	HOVER_SETTLE_MS: 50,
} as const satisfies Record<string, number>;

export type ExportFormat = "json" | "markdown" | "both";

export const EXTENSION_VERSION = "1.0.0";

export const PLATFORM_CONFIG = {
	claude: {
		displayName: "Claude",
		domains: ["claude.ai"],
	},
	chatgpt: {
		displayName: "ChatGPT",
		domains: ["chatgpt.com", "chat.openai.com"],
	},
	gemini: {
		displayName: "Gemini",
		domains: ["gemini.google.com"],
	},
	grok: {
		displayName: "Grok",
		domains: ["grok.com"],
	},
	"grok-x": {
		displayName: "Grok (X)",
		domains: ["x.com"],
	},
	perplexity: {
		displayName: "Perplexity",
		domains: ["perplexity.ai"],
	},
	deepseek: {
		displayName: "DeepSeek",
		domains: ["chat.deepseek.com"],
	},
} as const;

export type Platform = keyof typeof PLATFORM_CONFIG;
