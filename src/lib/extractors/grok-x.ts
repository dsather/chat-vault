import type { Turn } from "./base";
import { BaseExtractor } from "./base";

export class GrokXExtractor extends BaseExtractor {
	readonly platform = "grok-x";
	readonly displayName = "Grok (X)";

	findScrollContainer(): HTMLElement | null {
		return (
			document.querySelector<HTMLElement>('[data-testid="grok-conversation"]') ??
			document.querySelector<HTMLElement>('[role="main"]')
		);
	}

	findTurnContainers(): Element[] {
		const turns = document.querySelectorAll('[data-testid^="grok-message-"]');
		if (turns.length > 0) return Array.from(turns);

		return Array.from(document.querySelectorAll('[class*="message"][class*="container"]'));
	}

	classifyRole(
		container: Element,
		index: number,
	): { role: Turn["role"]; confidence: number; source: Turn["source"] } {
		const testId = container.getAttribute("data-testid");
		if (testId?.includes("user")) return { role: "user", confidence: 0.9, source: "structural" };
		if (testId?.includes("grok"))
			return { role: "assistant", confidence: 0.9, source: "structural" };

		const hasAvatar = container.querySelector('img[alt*="avatar"], img[alt*="profile"]');
		if (hasAvatar) return { role: "user", confidence: 0.7, source: "heuristic" };

		return {
			role: index % 2 === 0 ? "user" : "assistant",
			confidence: 0.5,
			source: "heuristic",
		};
	}

	getCopyButtonSelectors(): string[] {
		return [
			'button[aria-label="Copy text"]',
			'button[aria-label="Copy"]',
			'button[data-testid="copy-button"]',
		];
	}

	getDirectTextContent(container: Element): string | null {
		const spans = container.querySelectorAll("span");
		const textParts: string[] = [];
		for (const span of spans) {
			const text = span.textContent?.trim();
			if (text) textParts.push(text);
		}
		if (textParts.length > 0) return textParts.join("\n");

		return container.textContent?.trim() || null;
	}
}
