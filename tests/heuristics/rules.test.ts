import {
	h1Position,
	h2Length,
	h3CodeDensity,
	h4QuestionPattern,
	h5MarkdownFormatting,
	h6InstructionalPhrasing,
	h7ListStructure,
} from "@/lib/heuristics/rules";
import { describe, expect, it } from "vitest";

describe("h1Position", () => {
	it("classifies first turn as user with moderate confidence", () => {
		const result = h1Position(0);
		expect(result.role).toBe("user");
		expect(result.confidence).toBeGreaterThanOrEqual(0.6);
	});

	it("alternates for subsequent turns", () => {
		expect(h1Position(1).role).toBe("assistant");
		expect(h1Position(2).role).toBe("user");
		expect(h1Position(3).role).toBe("assistant");
	});
});

describe("h2Length", () => {
	it("classifies short messages as user", () => {
		const result = h2Length(50);
		expect(result.role).toBe("user");
	});

	it("classifies long messages as assistant", () => {
		const result = h2Length(600);
		expect(result.role).toBe("assistant");
	});

	it("returns null for medium-length messages", () => {
		const result = h2Length(250);
		expect(result.role).toBeNull();
	});
});

describe("h3CodeDensity", () => {
	it("classifies content with code blocks as assistant", () => {
		const content = "Here is some code:\n```typescript\nconst x = 1;\n```";
		const result = h3CodeDensity(content);
		expect(result.role).toBe("assistant");
		expect(result.confidence).toBeGreaterThan(0.5);
	});

	it("returns null for content without code blocks", () => {
		const result = h3CodeDensity("Just some plain text here");
		expect(result.role).toBeNull();
	});
});

describe("h4QuestionPattern", () => {
	it("classifies content ending with question as user", () => {
		const result = h4QuestionPattern("What is TypeScript?");
		expect(result.role).toBe("user");
	});

	it("returns null for non-question content", () => {
		const result = h4QuestionPattern("TypeScript is a language.");
		expect(result.role).toBeNull();
	});
});

describe("h5MarkdownFormatting", () => {
	it("classifies heavily formatted content as assistant", () => {
		const content = "# Title\n\n- Item 1\n- Item 2\n- Item 3\n\n**Bold text** here";
		const result = h5MarkdownFormatting(content);
		expect(result.role).toBe("assistant");
	});

	it("returns null for unformatted content", () => {
		const result = h5MarkdownFormatting("Just plain text");
		expect(result.role).toBeNull();
	});
});

describe("h6InstructionalPhrasing", () => {
	it("classifies instructional phrases as user", () => {
		expect(h6InstructionalPhrasing("Please explain how this works").role).toBe("user");
		expect(h6InstructionalPhrasing("Can you help me debug this?").role).toBe("user");
		expect(h6InstructionalPhrasing("Write a function that sorts").role).toBe("user");
	});

	it("returns null for non-instructional content", () => {
		const result = h6InstructionalPhrasing("TypeScript is a language");
		expect(result.role).toBeNull();
	});
});

describe("h7ListStructure", () => {
	it("classifies numbered lists as assistant", () => {
		const content = "1. First item\n2. Second item\n3. Third item";
		const result = h7ListStructure(content);
		expect(result.role).toBe("assistant");
	});

	it("returns null for content without lists", () => {
		const result = h7ListStructure("No lists here at all");
		expect(result.role).toBeNull();
	});
});
