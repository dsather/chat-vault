import type { ExtractionResult } from "@/lib/extractors/base";
import { serializeToMarkdown } from "@/lib/serializers/markdown";
import { describe, expect, it } from "vitest";

function makeResult(overrides?: Partial<ExtractionResult>): ExtractionResult {
	return {
		turns: [
			{
				role: "user",
				content: "What is TypeScript?",
				confidence: 0.95,
				source: "structural",
			},
			{
				role: "assistant",
				content: "TypeScript is a typed superset of JavaScript.",
				confidence: 0.9,
				source: "clipboard",
			},
		],
		errors: [],
		warnings: [],
		partial: false,
		durationMs: 800,
		...overrides,
	};
}

describe("serializeToMarkdown", () => {
	it("produces YAML frontmatter", () => {
		const output = serializeToMarkdown(makeResult(), "claude", "https://claude.ai/chat/abc");
		expect(output).toMatch(/^---\n/);
		expect(output).toMatch(/source_platform: claude/);
		expect(output).toMatch(/source_url: https:\/\/claude\.ai\/chat\/abc/);
		expect(output).toMatch(/schema_version: "2\.0"/);
	});

	it("includes turn headers with role labels", () => {
		const output = serializeToMarkdown(makeResult(), "claude", "https://claude.ai/chat/abc");
		expect(output).toContain("## Turn 1 — User");
		expect(output).toContain("## Turn 2 — Assistant");
	});

	it("includes turn content", () => {
		const output = serializeToMarkdown(makeResult(), "claude", "https://claude.ai/chat/abc");
		expect(output).toContain("What is TypeScript?");
		expect(output).toContain("TypeScript is a typed superset of JavaScript.");
	});

	it("includes total_turns in frontmatter", () => {
		const output = serializeToMarkdown(makeResult(), "claude", "https://claude.ai/chat/abc");
		expect(output).toContain("total_turns: 2");
	});

	it("includes integrity warnings when present", () => {
		const output = serializeToMarkdown(
			makeResult({
				turns: [
					{ role: "user", content: "A", confidence: 0.9, source: "structural" },
					{ role: "user", content: "B", confidence: 0.9, source: "structural" },
				],
			}),
			"claude",
			"https://claude.ai/chat/abc",
		);
		expect(output).toContain("integrity_warnings:");
		expect(output).toContain("Consecutive user turns");
	});
});
