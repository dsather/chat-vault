import { GeminiExtractor } from "@/lib/extractors/gemini";
import { onMessage } from "@/lib/messaging";
import { serializeToJson } from "@/lib/serializers/json";
import { serializeToMarkdown } from "@/lib/serializers/markdown";

export default defineContentScript({
	matches: ["https://gemini.google.com/*"],
	runAt: "document_idle",
	main() {
		const extractor = new GeminiExtractor();

		onMessage("detect", () => ({ platform: "gemini", supported: true }));

		onMessage("extract", async ({ data }) => {
			const startTime = performance.now();
			const result = await extractor.extract(data.format);
			const durationMs = performance.now() - startTime;
			const url = window.location.href;

			let json: string | undefined;
			let markdown: string | undefined;

			if (data.format === "json" || data.format === "both") {
				const jsonResult = serializeToJson(result, "gemini", url);
				json = jsonResult.raw;
			}
			if (data.format === "markdown" || data.format === "both") {
				markdown = serializeToMarkdown(result, "gemini", url);
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
