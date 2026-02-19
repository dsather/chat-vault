import type { Turn } from "../extractors/base";

export interface IntegrityReport {
	valid: boolean;
	warnings: string[];
}

export function checkIntegrity(turns: Turn[]): IntegrityReport {
	const warnings: string[] = [];

	if (turns.length === 0) {
		return { valid: false, warnings: ["No turns extracted"] };
	}

	// Check for empty content
	const emptyTurns = turns.filter((t) => !t.content.trim());
	if (emptyTurns.length > 0) {
		warnings.push(`${emptyTurns.length} turn(s) have empty content`);
	}

	// Check for alternation breaks
	for (let i = 1; i < turns.length; i++) {
		const prev = turns[i - 1]!;
		const curr = turns[i]!;
		if (prev.role === curr.role && prev.role !== "system") {
			warnings.push(`Consecutive ${curr.role} turns at positions ${i} and ${i + 1}`);
		}
	}

	// Check if first turn is user (expected pattern)
	if (turns.length > 0 && turns[0]?.role !== "user") {
		warnings.push("Conversation does not start with a user turn");
	}

	// Check for low confidence turns
	const lowConfidence = turns.filter((t) => t.confidence < 0.5);
	if (lowConfidence.length > 0) {
		warnings.push(`${lowConfidence.length} turn(s) have confidence below 0.5`);
	}

	// Check for duplicate content (potential copy errors)
	const seen = new Set<string>();
	let duplicates = 0;
	for (const turn of turns) {
		const hash = turn.content.slice(0, 200);
		if (seen.has(hash)) {
			duplicates++;
		}
		seen.add(hash);
	}
	if (duplicates > 0) {
		warnings.push(`${duplicates} potential duplicate turn(s) detected`);
	}

	return { valid: warnings.length === 0, warnings };
}
