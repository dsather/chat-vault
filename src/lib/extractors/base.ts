import type { ExportFormat } from "../constants";
import { SAFETY_LIMITS } from "../constants";
import { clickCopyAndRead, findActionButton, scrollToLoadAll, wait } from "../dom";

export interface Turn {
	role: "user" | "assistant" | "system";
	content: string;
	confidence: number;
	source: "clipboard" | "direct" | "heuristic" | "structural";
	extractionMethod?: "clipboard" | "direct";
	timestamp?: string;
	metadata?: Record<string, unknown>;
}

export interface ExtractionResult {
	turns: Turn[];
	errors: string[];
	warnings: string[];
	partial: boolean;
	durationMs: number;
}

export abstract class BaseExtractor {
	abstract readonly platform: string;
	abstract readonly displayName: string;

	abstract findScrollContainer(): HTMLElement | null;
	abstract findTurnContainers(): Element[];
	abstract classifyRole(
		container: Element,
		index: number,
	): { role: Turn["role"]; confidence: number; source: Turn["source"] };
	abstract getCopyButtonSelectors(): string[];
	abstract getDirectTextContent(container: Element): string | null;

	async extract(_format: ExportFormat): Promise<ExtractionResult> {
		const startTime = performance.now();
		const turns: Turn[] = [];
		const errors: string[] = [];
		const warnings: string[] = [];
		let partial = false;

		try {
			const scrollContainer = this.findScrollContainer();
			if (scrollContainer) {
				await scrollToLoadAll(scrollContainer, () => this.findTurnContainers().length);
			}

			const containers = this.findTurnContainers();
			if (containers.length === 0) {
				errors.push("No conversation turns found on page");
				return { turns, errors, warnings, partial: true, durationMs: elapsed(startTime) };
			}

			if (containers.length > SAFETY_LIMITS.MAX_TURNS) {
				warnings.push(
					`Conversation has ${containers.length} turns, capping at ${SAFETY_LIMITS.MAX_TURNS}`,
				);
				partial = true;
			}

			const limit = Math.min(containers.length, SAFETY_LIMITS.MAX_TURNS);
			for (let i = 0; i < limit; i++) {
				if (elapsed(startTime) > SAFETY_LIMITS.MAX_EXTRACTION_TIME_MS) {
					warnings.push(`Extraction timed out after ${SAFETY_LIMITS.MAX_EXTRACTION_TIME_MS}ms`);
					partial = true;
					break;
				}

				const container = containers[i]!;
				const turn = await this.extractTurn(container, i);
				if (turn) {
					if (turn.content.length > SAFETY_LIMITS.MAX_SINGLE_TURN_SIZE) {
						warnings.push(
							`Turn ${i + 1} truncated from ${turn.content.length} to ${SAFETY_LIMITS.MAX_SINGLE_TURN_SIZE} chars`,
						);
						turn.content = turn.content.slice(0, SAFETY_LIMITS.MAX_SINGLE_TURN_SIZE);
					}
					turns.push(turn);
				}
			}
		} catch (err) {
			errors.push(`Extraction error: ${err instanceof Error ? err.message : String(err)}`);
			partial = true;
		}

		return { turns, errors, warnings, partial, durationMs: elapsed(startTime) };
	}

	protected async extractTurn(container: Element, index: number): Promise<Turn | null> {
		const { role, confidence, source } = this.classifyRole(container, index);

		let content: string | null = null;
		let extractionMethod: "clipboard" | "direct" = "direct";

		const copyButton = findActionButton(container, this.getCopyButtonSelectors());
		if (copyButton) {
			await wait(SAFETY_LIMITS.HOVER_SETTLE_MS);
			content = await clickCopyAndRead(copyButton);
			if (content) {
				extractionMethod = "clipboard";
			}
		}

		if (!content) {
			content = this.getDirectTextContent(container);
			extractionMethod = "direct";
		}

		if (!content) return null;

		return {
			role,
			content,
			confidence,
			source,
			extractionMethod,
		};
	}
}

function elapsed(startTime: number): number {
	return performance.now() - startTime;
}
