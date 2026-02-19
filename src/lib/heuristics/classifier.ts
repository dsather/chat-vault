import type { HeuristicSignal } from "./rules";
import {
	h1Position,
	h2Length,
	h3CodeDensity,
	h4QuestionPattern,
	h5MarkdownFormatting,
	h6InstructionalPhrasing,
	h7ListStructure,
} from "./rules";

export interface ClassificationResult {
	role: "user" | "assistant";
	confidence: number;
	signals: HeuristicSignal[];
}

export function classifyRole(content: string, index: number): ClassificationResult {
	const signals: HeuristicSignal[] = [
		h1Position(index),
		h2Length(content.length),
		h3CodeDensity(content),
		h4QuestionPattern(content),
		h5MarkdownFormatting(content),
		h6InstructionalPhrasing(content),
		h7ListStructure(content),
	];

	let userScore = 0;
	let assistantScore = 0;
	let totalWeight = 0;

	for (const signal of signals) {
		if (signal.role === "user") {
			userScore += signal.confidence;
		} else if (signal.role === "assistant") {
			assistantScore += signal.confidence;
		}
		totalWeight += signal.confidence;
	}

	const role = userScore >= assistantScore ? "user" : "assistant";
	const winnerScore = Math.max(userScore, assistantScore);
	const confidence = totalWeight > 0 ? winnerScore / totalWeight : 0.5;

	return {
		role,
		confidence: Math.min(confidence, 0.95),
		signals,
	};
}
