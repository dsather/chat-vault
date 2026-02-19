import type { Turn } from "./base";
import { BaseExtractor } from "./base";

export class DeepSeekExtractor extends BaseExtractor {
	readonly platform = "deepseek";
	readonly displayName = "DeepSeek";

	findScrollContainer(): HTMLElement | null {
		return (
			document.querySelector<HTMLElement>('[class*="chat-container"]') ??
			document.querySelector<HTMLElement>("#chat-container") ??
			document.querySelector<HTMLElement>("main")
		);
	}

	findTurnContainers(): Element[] {
		const messages = document.querySelectorAll('[class*="message-item"], [class*="chat-message"]');
		if (messages.length > 0) return Array.from(messages);

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

		const className = container.className;
		if (className.includes("user")) return { role: "user", confidence: 0.8, source: "heuristic" };
		if (className.includes("assistant") || className.includes("bot")) {
			return { role: "assistant", confidence: 0.8, source: "heuristic" };
		}

		return {
			role: index % 2 === 0 ? "user" : "assistant",
			confidence: 0.5,
			source: "heuristic",
		};
	}

	getCopyButtonSelectors(): string[] {
		return ['button[aria-label="Copy"]', 'button[class*="copy"]'];
	}

	getDirectTextContent(container: Element): string | null {
		const markdown =
			container.querySelector('[class*="markdown"]') ?? container.querySelector('[class*="prose"]');
		if (markdown) return markdown.textContent?.trim() || null;

		return container.textContent?.trim() || null;
	}
}
