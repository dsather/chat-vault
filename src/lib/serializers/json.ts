import { EXTENSION_VERSION } from "../constants";
import type { ExtractionResult, Turn } from "../extractors/base";
import { checkIntegrity } from "../heuristics/integrity";
import type { ExportData, TurnData } from "./schema";
import { ExportSchema } from "./schema";

export function serializeToJson(
	result: ExtractionResult,
	platform: string,
	sourceUrl: string,
): { data: ExportData; raw: string } {
	const integrity = checkIntegrity(result.turns);

	const conversation: TurnData[] = result.turns.map((turn, index) => turnToData(turn, index + 1));

	const flaggedTurns = conversation.filter((t) => t.flagged).length;

	const data: ExportData = {
		schema_version: "2.0",
		export_metadata: {
			source_platform: platform,
			source_url: sourceUrl,
			export_timestamp: new Date().toISOString(),
			extension_version: EXTENSION_VERSION,
			total_turns: conversation.length,
			flagged_turns: flaggedTurns,
			integrity_warnings: [...result.warnings, ...integrity.warnings],
		},
		conversation,
	};

	const validated = ExportSchema.parse(data);
	return { data: validated, raw: JSON.stringify(validated, null, 2) };
}

function turnToData(turn: Turn, turnNumber: number): TurnData {
	const flagged = turn.confidence < 0.7;
	return {
		turn: turnNumber,
		role: turn.role,
		content: turn.content,
		classification_confidence: turn.confidence,
		classification_source: turn.source,
		extraction_method: turn.extractionMethod,
		timestamp: turn.timestamp,
		flagged: flagged || undefined,
		flag_reason: flagged ? `Low confidence: ${turn.confidence.toFixed(2)}` : undefined,
	};
}
