export interface HeuristicSignal {
	rule: string;
	role: "user" | "assistant" | null;
	confidence: number;
	reason: string;
}

/** H1: Position-based — first turn is typically user */
export function h1Position(index: number): HeuristicSignal {
	if (index === 0) {
		return { rule: "H1", role: "user", confidence: 0.7, reason: "First turn is typically user" };
	}
	return {
		rule: "H1",
		role: index % 2 === 0 ? "user" : "assistant",
		confidence: 0.4,
		reason: "Alternating pattern assumption",
	};
}

/** H2: Length-based — short messages more likely user, long messages more likely assistant */
export function h2Length(contentLength: number): HeuristicSignal {
	if (contentLength < 100) {
		return { rule: "H2", role: "user", confidence: 0.6, reason: "Short message suggests user" };
	}
	if (contentLength > 500) {
		return {
			rule: "H2",
			role: "assistant",
			confidence: 0.65,
			reason: "Long message suggests assistant",
		};
	}
	return { rule: "H2", role: null, confidence: 0.3, reason: "Medium length is ambiguous" };
}

/** H3: Code block density — high code density suggests assistant */
export function h3CodeDensity(content: string): HeuristicSignal {
	const codeBlockCount = (content.match(/```/g) || []).length / 2;
	if (codeBlockCount >= 1) {
		return {
			rule: "H3",
			role: "assistant",
			confidence: 0.75,
			reason: `Contains ${Math.floor(codeBlockCount)} code block(s)`,
		};
	}
	return { rule: "H3", role: null, confidence: 0.2, reason: "No code blocks" };
}

/** H4: Question patterns — questions at end suggest user */
export function h4QuestionPattern(content: string): HeuristicSignal {
	const lines = content.trim().split("\n");
	const lastLine = lines[lines.length - 1] ?? "";
	if (lastLine.trim().endsWith("?")) {
		return {
			rule: "H4",
			role: "user",
			confidence: 0.6,
			reason: "Ends with a question mark",
		};
	}
	return { rule: "H4", role: null, confidence: 0.2, reason: "No trailing question" };
}

/** H5: Markdown formatting — heavy formatting suggests assistant */
export function h5MarkdownFormatting(content: string): HeuristicSignal {
	const headings = (content.match(/^#{1,6}\s/gm) || []).length;
	const bullets = (content.match(/^[\s]*[-*]\s/gm) || []).length;
	const bold = (content.match(/\*\*[^*]+\*\*/g) || []).length;
	const total = headings + bullets + bold;

	if (total >= 3) {
		return {
			rule: "H5",
			role: "assistant",
			confidence: 0.7,
			reason: `${total} markdown formatting elements found`,
		};
	}
	return { rule: "H5", role: null, confidence: 0.2, reason: "Minimal formatting" };
}

/** H6: Instructional phrasing — imperative verbs suggest user */
export function h6InstructionalPhrasing(content: string): HeuristicSignal {
	const firstLine = content.trim().split("\n")[0] ?? "";
	const instructionPatterns =
		/^(please |can you |could you |help me |write |create |explain |fix |show |make |build |implement |add |update |change )/i;

	if (instructionPatterns.test(firstLine)) {
		return {
			rule: "H6",
			role: "user",
			confidence: 0.7,
			reason: "Starts with instructional phrasing",
		};
	}
	return { rule: "H6", role: null, confidence: 0.2, reason: "No instructional phrasing" };
}

/** H7: List structure — numbered/ordered lists suggest assistant */
export function h7ListStructure(content: string): HeuristicSignal {
	const numberedItems = (content.match(/^\d+\.\s/gm) || []).length;
	if (numberedItems >= 3) {
		return {
			rule: "H7",
			role: "assistant",
			confidence: 0.65,
			reason: `${numberedItems} numbered list items found`,
		};
	}
	return { rule: "H7", role: null, confidence: 0.2, reason: "No significant list structure" };
}
