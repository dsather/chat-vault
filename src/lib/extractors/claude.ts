import type { Turn } from "./base";
import { BaseExtractor } from "./base";

export class ClaudeExtractor extends BaseExtractor {
	readonly platform = "claude";
	readonly displayName = "Claude";

	findScrollContainer(): HTMLElement | null {
		return (
			document.querySelector<HTMLElement>('[class*="ThreadLayout"]') ??
			document.querySelector<HTMLElement>('[class*="conversation"]') ??
			document.querySelector<HTMLElement>("main")
		);
	}

	findTurnContainers(): Element[] {
		const turns = document.querySelectorAll("[data-test-render-count]");
		if (turns.length > 0) return Array.from(turns);

		const userMessages = document.querySelectorAll('[data-testid="user-message"]');
		const assistantMessages = document.querySelectorAll(".font-claude-message");
		const combined: Element[] = [];
		const max = Math.max(userMessages.length, assistantMessages.length);
		for (let i = 0; i < max; i++) {
			if (i < userMessages.length) combined.push(userMessages[i]!);
			if (i < assistantMessages.length) combined.push(assistantMessages[i]!);
		}
		return combined;
	}

	classifyRole(
		container: Element,
		index: number,
	): { role: Turn["role"]; confidence: number; source: Turn["source"] } {
		if (container.matches('[data-testid="user-message"]')) {
			return { role: "user", confidence: 0.95, source: "structural" };
		}
		if (container.matches(".font-claude-message")) {
			return { role: "assistant", confidence: 0.95, source: "structural" };
		}
		if (container.querySelector('[data-testid="user-message"]')) {
			return { role: "user", confidence: 0.9, source: "structural" };
		}
		if (container.querySelector(".font-claude-message")) {
			return { role: "assistant", confidence: 0.9, source: "structural" };
		}
		return {
			role: index % 2 === 0 ? "user" : "assistant",
			confidence: 0.5,
			source: "heuristic",
		};
	}

	getCopyButtonSelectors(): string[] {
		return ['button[data-testid="action-bar-copy"]', 'button[aria-label="Copy"]'];
	}

	getDirectTextContent(container: Element): string | null {
		const userMsg = container.querySelector('[data-testid="user-message"]');
		if (userMsg) return userMsg.textContent?.trim() || null;

		const assistantMsg = container.querySelector(".font-claude-message");
		if (assistantMsg) return assistantMsg.textContent?.trim() || null;

		return container.textContent?.trim() || null;
	}
}
