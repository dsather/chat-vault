import { z } from "zod";

export const TurnSchema = z.object({
	turn: z.number().int().positive(),
	role: z.enum(["user", "assistant", "system"]),
	content: z.string().min(1),
	classification_confidence: z.number().min(0).max(1),
	classification_source: z.enum(["clipboard", "direct", "heuristic", "structural"]),
	extraction_method: z.enum(["clipboard", "direct"]).optional(),
	timestamp: z.string().optional(),
	flagged: z.boolean().optional(),
	flag_reason: z.string().optional(),
});

export const ExportSchema = z.object({
	schema_version: z.literal("2.0"),
	export_metadata: z.object({
		source_platform: z.string(),
		source_url: z.string().url(),
		export_timestamp: z.string().datetime(),
		extension_version: z.string(),
		total_turns: z.number().int().nonnegative(),
		flagged_turns: z.number().int().nonnegative(),
		integrity_warnings: z.array(z.string()),
	}),
	conversation: z.array(TurnSchema),
});

export type ExportData = z.infer<typeof ExportSchema>;
export type TurnData = z.infer<typeof TurnSchema>;
