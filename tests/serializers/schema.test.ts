import { ExportSchema, TurnSchema } from "@/lib/serializers/schema";
import { describe, expect, it } from "vitest";

describe("TurnSchema", () => {
	it("accepts a valid turn", () => {
		const result = TurnSchema.safeParse({
			turn: 1,
			role: "user",
			content: "Hello, how are you?",
			classification_confidence: 0.95,
			classification_source: "structural",
		});
		expect(result.success).toBe(true);
	});

	it("accepts a turn with optional fields", () => {
		const result = TurnSchema.safeParse({
			turn: 2,
			role: "assistant",
			content: "I'm doing well!",
			classification_confidence: 0.9,
			classification_source: "clipboard",
			extraction_method: "clipboard",
			timestamp: "2024-01-15T10:30:00Z",
			flagged: true,
			flag_reason: "Low confidence",
		});
		expect(result.success).toBe(true);
	});

	it("rejects turn with empty content", () => {
		const result = TurnSchema.safeParse({
			turn: 1,
			role: "user",
			content: "",
			classification_confidence: 0.9,
			classification_source: "direct",
		});
		expect(result.success).toBe(false);
	});

	it("rejects turn with invalid role", () => {
		const result = TurnSchema.safeParse({
			turn: 1,
			role: "moderator",
			content: "Hello",
			classification_confidence: 0.9,
			classification_source: "direct",
		});
		expect(result.success).toBe(false);
	});

	it("rejects turn with confidence above 1", () => {
		const result = TurnSchema.safeParse({
			turn: 1,
			role: "user",
			content: "Hello",
			classification_confidence: 1.5,
			classification_source: "direct",
		});
		expect(result.success).toBe(false);
	});

	it("rejects turn with negative confidence", () => {
		const result = TurnSchema.safeParse({
			turn: 1,
			role: "user",
			content: "Hello",
			classification_confidence: -0.1,
			classification_source: "direct",
		});
		expect(result.success).toBe(false);
	});

	it("rejects turn with zero or negative turn number", () => {
		const result = TurnSchema.safeParse({
			turn: 0,
			role: "user",
			content: "Hello",
			classification_confidence: 0.9,
			classification_source: "direct",
		});
		expect(result.success).toBe(false);
	});

	it("rejects turn with invalid classification source", () => {
		const result = TurnSchema.safeParse({
			turn: 1,
			role: "user",
			content: "Hello",
			classification_confidence: 0.9,
			classification_source: "magic",
		});
		expect(result.success).toBe(false);
	});
});

describe("ExportSchema", () => {
	const validExport = {
		schema_version: "2.0" as const,
		export_metadata: {
			source_platform: "claude",
			source_url: "https://claude.ai/chat/abc123",
			export_timestamp: "2024-01-15T10:30:00.000Z",
			extension_version: "1.0.0",
			total_turns: 2,
			flagged_turns: 0,
			integrity_warnings: [],
		},
		conversation: [
			{
				turn: 1,
				role: "user" as const,
				content: "Hello!",
				classification_confidence: 0.95,
				classification_source: "structural" as const,
			},
			{
				turn: 2,
				role: "assistant" as const,
				content: "Hi there!",
				classification_confidence: 0.9,
				classification_source: "clipboard" as const,
				extraction_method: "clipboard" as const,
			},
		],
	};

	it("accepts a valid export", () => {
		const result = ExportSchema.safeParse(validExport);
		expect(result.success).toBe(true);
	});

	it("rejects wrong schema version", () => {
		const result = ExportSchema.safeParse({
			...validExport,
			schema_version: "1.0",
		});
		expect(result.success).toBe(false);
	});

	it("rejects invalid source URL", () => {
		const result = ExportSchema.safeParse({
			...validExport,
			export_metadata: {
				...validExport.export_metadata,
				source_url: "not-a-url",
			},
		});
		expect(result.success).toBe(false);
	});

	it("rejects negative total_turns", () => {
		const result = ExportSchema.safeParse({
			...validExport,
			export_metadata: {
				...validExport.export_metadata,
				total_turns: -1,
			},
		});
		expect(result.success).toBe(false);
	});

	it("accepts empty conversation array", () => {
		const result = ExportSchema.safeParse({
			...validExport,
			export_metadata: {
				...validExport.export_metadata,
				total_turns: 0,
			},
			conversation: [],
		});
		expect(result.success).toBe(true);
	});
});
