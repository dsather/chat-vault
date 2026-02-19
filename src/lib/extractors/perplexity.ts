import type { Turn } from "./base";
import { BaseExtractor } from "./base";

export class PerplexityExtractor extends BaseExtractor {
	readonly platform = "perplexity";
	readonly displayName = "Perplexity";

	findScrollContainer(): HTMLElement | null {
		return (
			document.querySelector<HTMLElement>('[class*="ThreadLayout"]') ??
			document.querySelector<HTMLElement>("main")
		);
	}

	findTurnContainers(): Element[] {
		const queries = document.querySelectorAll('[class*="UserQuery"], [class*="query-text"]');
		const answers = document.querySelectorAll(
			'[class*="AnswerBlock"], [class*="prose"], [class*="answer-text"]',
		);

		const combined: Element[] = [];
		const max = Math.max(queries.length, answers.length);
		for (let i = 0; i < max; i++) {
			if (i < queries.length) combined.push(queries[i]!);
			if (i < answers.length) combined.push(answers[i]!);
		}
		return combined;
	}

	classifyRole(container: Element): {
		role: Turn["role"];
		confidence: number;
		source: Turn["source"];
	} {
		const className = container.className;
		if (className.includes("UserQuery") || className.includes("query-text")) {
			return { role: "user", confidence: 0.9, source: "structural" };
		}
		if (
			className.includes("AnswerBlock") ||
			className.includes("answer-text") ||
			className.includes("prose")
		) {
			return { role: "assistant", confidence: 0.9, source: "structural" };
		}
		return { role: "assistant", confidence: 0.5, source: "heuristic" };
	}

	getCopyButtonSelectors(): string[] {
		return ['button[aria-label="Copy"]', 'button[aria-label="Copy Answer"]'];
	}

	getDirectTextContent(container: Element): string | null {
		const prose = container.querySelector('[class*="prose"]');
		if (prose) return prose.textContent?.trim() || null;

		return container.textContent?.trim() || null;
	}
}
