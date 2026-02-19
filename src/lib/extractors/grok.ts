import type { Turn } from "./base";
import { BaseExtractor } from "./base";

export class GrokExtractor extends BaseExtractor {
	readonly platform = "grok";
	readonly displayName = "Grok";

	findScrollContainer(): HTMLElement | null {
		return (
			document.querySelector<HTMLElement>('[class*="conversation"]') ??
			document.querySelector<HTMLElement>("main")
		);
	}

	findTurnContainers(): Element[] {
		const responses = document.querySelectorAll('div[id^="response-"]');
		if (responses.length > 0) return Array.from(responses);

		return Array.from(document.querySelectorAll('[data-role="user"], [data-role="assistant"]'));
	}

	classifyRole(
		container: Element,
		index: number,
	): { role: Turn["role"]; confidence: number; source: Turn["source"] } {
		const dataRole = container.getAttribute("data-role");
		if (dataRole === "user") return { role: "user", confidence: 0.95, source: "structural" };
		if (dataRole === "assistant")
			return { role: "assistant", confidence: 0.95, source: "structural" };

		if (container.querySelector('[class*="avatar"]')) {
			const avatarEl = container.querySelector('[class*="avatar"]');
			if (avatarEl?.textContent?.includes("You")) {
				return { role: "user", confidence: 0.8, source: "heuristic" };
			}
			return { role: "assistant", confidence: 0.7, source: "heuristic" };
		}

		return {
			role: index % 2 === 0 ? "user" : "assistant",
			confidence: 0.5,
			source: "heuristic",
		};
	}

	getCopyButtonSelectors(): string[] {
		return ['button[aria-label="Copy"]', 'button[aria-label="Copy text"]'];
	}

	getDirectTextContent(container: Element): string | null {
		const message =
			container.querySelector('[class*="message-content"]') ??
			container.querySelector('[class*="prose"]');
		if (message) return message.textContent?.trim() || null;

		return container.textContent?.trim() || null;
	}
}
