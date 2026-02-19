import { EXTENSION_VERSION } from "../constants";
import type { ExtractionResult } from "../extractors/base";
import { checkIntegrity } from "../heuristics/integrity";

export function serializeToMarkdown(
	result: ExtractionResult,
	platform: string,
	sourceUrl: string,
): string {
	const integrity = checkIntegrity(result.turns);
	const allWarnings = [...result.warnings, ...integrity.warnings];
	const now = new Date().toISOString();

	const lines: string[] = [
		"---",
		`source_platform: ${platform}`,
		`source_url: ${sourceUrl}`,
		`export_timestamp: ${now}`,
		`extension_version: ${EXTENSION_VERSION}`,
		`total_turns: ${result.turns.length}`,
		`schema_version: "2.0"`,
	];

	if (allWarnings.length > 0) {
		lines.push("integrity_warnings:");
		for (const warning of allWarnings) {
			lines.push(`  - "${warning}"`);
		}
	}

	lines.push("---", "");

	for (let i = 0; i < result.turns.length; i++) {
		const turn = result.turns[i]!;
		const roleLabel =
			turn.role === "user" ? "User" : turn.role === "assistant" ? "Assistant" : "System";

		lines.push(`## Turn ${i + 1} — ${roleLabel}`);
		lines.push("");
		lines.push(turn.content);
		lines.push("");
	}

	return lines.join("\n");
}
