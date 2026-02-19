import type { Turn } from "./base";
import { BaseExtractor } from "./base";

export class GeminiExtractor extends BaseExtractor {
	readonly platform = "gemini";
	readonly displayName = "Gemini";

	findScrollContainer(): HTMLElement | null {
		return (
			document.querySelector<HTMLElement>(".conversation-container") ??
			document.querySelector<HTMLElement>("main")
		);
	}

	findTurnContainers(): Element[] {
		const queries = document.querySelectorAll("user-query");
		const responses = document.querySelectorAll("model-response");

		const combined: Element[] = [];
		const max = Math.max(queries.length, responses.length);
		for (let i = 0; i < max; i++) {
			if (i < queries.length) combined.push(queries[i]!);
			if (i < responses.length) combined.push(responses[i]!);
		}

		if (combined.length > 0) return combined;

		return Array.from(document.querySelectorAll("div.conversation-container[id]"));
	}

	classifyRole(container: Element): {
		role: Turn["role"];
		confidence: number;
		source: Turn["source"];
	} {
		if (container.tagName.toLowerCase() === "user-query") {
			return { role: "user", confidence: 0.99, source: "structural" };
		}
		if (container.tagName.toLowerCase() === "model-response") {
			return { role: "assistant", confidence: 0.99, source: "structural" };
		}
		if (container.querySelector("user-query")) {
			return { role: "user", confidence: 0.9, source: "structural" };
		}
		if (container.querySelector("model-response")) {
			return { role: "assistant", confidence: 0.9, source: "structural" };
		}
		return { role: "assistant", confidence: 0.5, source: "heuristic" };
	}

	getCopyButtonSelectors(): string[] {
		return [
			'button[aria-label="Copy prompt"]',
			'button[data-test-id="copy-button"]',
			'button[aria-label="Copy"]',
		];
	}

	getDirectTextContent(container: Element): string | null {
		const messageContent =
			container.querySelector(".query-text") ??
			container.querySelector(".model-response-text") ??
			container.querySelector(".markdown-main-panel");
		if (messageContent) return messageContent.textContent?.trim() || null;

		return container.textContent?.trim() || null;
	}
}
