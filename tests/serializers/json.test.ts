import type { ExtractionResult } from "@/lib/extractors/base";
import { serializeToJson } from "@/lib/serializers/json";
import { ExportSchema } from "@/lib/serializers/schema";
import { describe, expect, it } from "vitest";

function makeResult(overrides?: Partial<ExtractionResult>): ExtractionResult {
	return {
		turns: [
			{
				role: "user",
				content: "Hello!",
				confidence: 0.95,
				source: "structural",
				extractionMethod: "direct",
			},
			{
				role: "assistant",
				content: "Hi there! How can I help you today?",
				confidence: 0.9,
				source: "clipboard",
				extractionMethod: "clipboard",
			},
		],
		errors: [],
		warnings: [],
		partial: false,
		durationMs: 1200,
		...overrides,
	};
}

describe("serializeToJson", () => {
	it("produces valid export data", () => {
		const { data } = serializeToJson(makeResult(), "claude", "https://claude.ai/chat/abc");
		expect(data.schema_version).toBe("2.0");
		expect(data.conversation).toHaveLength(2);
		expect(data.export_metadata.source_platform).toBe("claude");
	});

	it("passes Zod validation", () => {
		const { data } = serializeToJson(makeResult(), "chatgpt", "https://chatgpt.com/c/abc");
		const result = ExportSchema.safeParse(data);
		expect(result.success).toBe(true);
	});

	it("produces valid JSON string", () => {
		const { raw } = serializeToJson(makeResult(), "claude", "https://claude.ai/chat/abc");
		const parsed = JSON.parse(raw);
		expect(parsed.schema_version).toBe("2.0");
	});

	it("flags low-confidence turns", () => {
		const { data } = serializeToJson(
			makeResult({
				turns: [
					{
						role: "user",
						content: "Hello",
						confidence: 0.5,
						source: "heuristic",
					},
				],
			}),
			"claude",
			"https://claude.ai/chat/abc",
		);
		expect(data.conversation[0]?.flagged).toBe(true);
		expect(data.export_metadata.flagged_turns).toBe(1);
	});

	it("includes integrity warnings", () => {
		const { data } = serializeToJson(
			makeResult({
				turns: [
					{ role: "user", content: "A", confidence: 0.9, source: "structural" },
					{ role: "user", content: "B", confidence: 0.9, source: "structural" },
				],
				warnings: ["existing warning"],
			}),
			"claude",
			"https://claude.ai/chat/abc",
		);
		expect(data.export_metadata.integrity_warnings.length).toBeGreaterThan(0);
	});
});
