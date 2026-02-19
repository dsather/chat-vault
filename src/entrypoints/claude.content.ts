import { ClaudeExtractor } from "@/lib/extractors/claude";
import { onMessage } from "@/lib/messaging";
import { serializeToJson } from "@/lib/serializers/json";
import { serializeToMarkdown } from "@/lib/serializers/markdown";

export default defineContentScript({
	matches: ["https://claude.ai/chat/*"],
	runAt: "document_idle",
	main() {
		const extractor = new ClaudeExtractor();

		onMessage("detect", () => ({ platform: "claude", supported: true }));

		onMessage("extract", async ({ data }) => {
			const startTime = performance.now();
			const result = await extractor.extract(data.format);
			const durationMs = performance.now() - startTime;
			const url = window.location.href;

			let json: string | undefined;
			let markdown: string | undefined;

			if (data.format === "json" || data.format === "both") {
				const jsonResult = serializeToJson(result, "claude", url);
				json = jsonResult.raw;
			}
			if (data.format === "markdown" || data.format === "both") {
				markdown = serializeToMarkdown(result, "claude", url);
			}

			return {
				success: result.errors.length === 0,
				json,
				markdown,
				turnCount: result.turns.length,
				errors: result.errors,
				warnings: result.warnings,
				durationMs,
			};
		});
	},
});
