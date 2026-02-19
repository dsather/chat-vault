import type { ExportFormat } from "@/lib/constants";
import { downloadFile } from "@/lib/download";
import { sendMessage } from "@/lib/messaging";

const statusEl = document.getElementById("status")!;
const controlsEl = document.getElementById("controls")!;
const exportBtn = document.getElementById("export-btn") as HTMLButtonElement;
const resultsEl = document.getElementById("results")!;
const resultInfoEl = document.getElementById("result-info")!;
const errorSection = document.getElementById("error-section")!;
const errorMessage = document.getElementById("error-message")!;

async function init() {
	try {
		const response = await sendMessage("detect", undefined);
		if (response?.supported) {
			statusEl.textContent = `Connected to ${response.platform}`;
			statusEl.classList.add("detected");
			controlsEl.classList.remove("hidden");
		} else {
			statusEl.textContent = "No supported AI chat detected on this page";
			statusEl.classList.add("error");
		}
	} catch {
		statusEl.textContent = "No supported AI chat detected on this page";
		statusEl.classList.add("error");
	}
}

function getSelectedFormat(): ExportFormat {
	const selected = document.querySelector<HTMLInputElement>('input[name="format"]:checked');
	return (selected?.value as ExportFormat) ?? "json";
}

exportBtn.addEventListener("click", async () => {
	exportBtn.disabled = true;
	exportBtn.classList.add("loading");
	resultsEl.classList.add("hidden");
	errorSection.classList.add("hidden");

	try {
		const format = getSelectedFormat();
		const result = await sendMessage("extract", { format });

		if (result.errors.length > 0) {
			errorMessage.textContent = result.errors.join("; ");
			errorSection.classList.remove("hidden");
		}

		if (result.turnCount > 0) {
			const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);

			if (result.json) {
				await downloadFile(result.json, `chat-vault-${timestamp}.json`, "application/json");
			}
			if (result.markdown) {
				await downloadFile(result.markdown, `chat-vault-${timestamp}.md`, "text/markdown");
			}

			let info = `<p class="success">Exported ${result.turnCount} turns in ${(result.durationMs / 1000).toFixed(1)}s</p>`;
			if (result.warnings.length > 0) {
				info += result.warnings.map((w) => `<p class="warning">${w}</p>`).join("");
			}
			resultInfoEl.innerHTML = info;
			resultsEl.classList.remove("hidden");
		}
	} catch (err) {
		errorMessage.textContent = err instanceof Error ? err.message : "Export failed unexpectedly";
		errorSection.classList.remove("hidden");
	} finally {
		exportBtn.disabled = false;
		exportBtn.classList.remove("loading");
	}
});

init();
