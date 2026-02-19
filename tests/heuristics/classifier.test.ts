import { classifyRole } from "@/lib/heuristics/classifier";
import { describe, expect, it } from "vitest";

describe("classifyRole", () => {
	it("classifies a short question at index 0 as user", () => {
		const result = classifyRole("What is TypeScript?", 0);
		expect(result.role).toBe("user");
		expect(result.confidence).toBeGreaterThan(0.4);
	});

	it("classifies a long formatted response as assistant", () => {
		const content = [
			"# TypeScript Overview",
			"",
			"TypeScript is a typed superset of JavaScript that compiles to plain JavaScript.",
			"",
			"## Key Features",
			"",
			"1. Static type checking",
			"2. Enhanced IDE support",
			"3. Better refactoring",
			"",
			"```typescript",
			"const greeting: string = 'Hello, World!';",
			"```",
			"",
			"**Type safety** helps catch errors at compile time rather than runtime.",
		].join("\n");

		const result = classifyRole(content, 1);
		expect(result.role).toBe("assistant");
		expect(result.confidence).toBeGreaterThan(0.4);
	});

	it("returns all 7 signals", () => {
		const result = classifyRole("Hello", 0);
		expect(result.signals).toHaveLength(7);
	});

	it("caps confidence at 0.95", () => {
		const result = classifyRole("Please help me", 0);
		expect(result.confidence).toBeLessThanOrEqual(0.95);
	});

	it("classifies instructional content as user", () => {
		const result = classifyRole("Please explain how async/await works in JavaScript?", 0);
		expect(result.role).toBe("user");
	});
});
