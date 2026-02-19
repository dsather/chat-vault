import type { Turn } from "./base";
import { BaseExtractor } from "./base";

export class ChatGPTExtractor extends BaseExtractor {
	readonly platform = "chatgpt";
	readonly displayName = "ChatGPT";

	findScrollContainer(): HTMLElement | null {
		return (
			document.querySelector<HTMLElement>('[class*="react-scroll-to-bottom"]') ??
			document.querySelector<HTMLElement>("main")
		);
	}

	findTurnContainers(): Element[] {
		const articles = document.querySelectorAll('article[data-testid^="conversation-turn-"]');
		if (articles.length > 0) return Array.from(articles);

		return Array.from(document.querySelectorAll("[data-message-author-role]"));
	}

	classifyRole(container: Element): {
		role: Turn["role"];
		confidence: number;
		source: Turn["source"];
	} {
		const authorRole = container.getAttribute("data-message-author-role");
		if (authorRole === "user") {
			return { role: "user", confidence: 0.99, source: "structural" };
		}
		if (authorRole === "assistant") {
			return { role: "assistant", confidence: 0.99, source: "structural" };
		}

		const turnId = container.getAttribute("data-testid");
		if (turnId) {
			const match = turnId.match(/conversation-turn-(\d+)/);
			if (match) {
				const turnNum = Number.parseInt(match[1]!, 10);
				return {
					role: turnNum % 2 === 1 ? "user" : "assistant",
					confidence: 0.8,
					source: "heuristic",
				};
			}
		}

		return { role: "assistant", confidence: 0.5, source: "heuristic" };
	}

	getCopyButtonSelectors(): string[] {
		return ['button[data-testid="copy-turn-action-button"]', 'button[aria-label="Copy"]'];
	}

	getDirectTextContent(container: Element): string | null {
		const markdown = container.querySelector(".markdown");
		if (markdown) return markdown.textContent?.trim() || null;

		const prose = container.querySelector('[class*="prose"]');
		if (prose) return prose.textContent?.trim() || null;

		return container.textContent?.trim() || null;
	}
}
