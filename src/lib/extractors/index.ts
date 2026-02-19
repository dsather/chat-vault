import type { Platform } from "../constants";
import type { BaseExtractor } from "./base";
import { ChatGPTExtractor } from "./chatgpt";
import { ClaudeExtractor } from "./claude";
import { DeepSeekExtractor } from "./deepseek";
import { GeminiExtractor } from "./gemini";
import { GrokExtractor } from "./grok";
import { GrokXExtractor } from "./grok-x";
import { PerplexityExtractor } from "./perplexity";

export const extractorRegistry: Record<Platform, () => BaseExtractor> = {
	claude: () => new ClaudeExtractor(),
	chatgpt: () => new ChatGPTExtractor(),
	gemini: () => new GeminiExtractor(),
	grok: () => new GrokExtractor(),
	"grok-x": () => new GrokXExtractor(),
	perplexity: () => new PerplexityExtractor(),
	deepseek: () => new DeepSeekExtractor(),
};

export function getExtractor(platform: Platform): BaseExtractor {
	return extractorRegistry[platform]();
}
