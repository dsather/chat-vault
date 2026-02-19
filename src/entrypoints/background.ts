import { onMessage } from "@/lib/messaging";

export default defineBackground(() => {
	onMessage("download", async ({ data }) => {
		try {
			const blob = new Blob([data.content], { type: data.mimeType });
			const url = URL.createObjectURL(blob);

			await browser.downloads.download({
				url,
				filename: data.filename,
				saveAs: true,
			});

			setTimeout(() => URL.revokeObjectURL(url), 60_000);
			return { success: true };
		} catch {
			return { success: false };
		}
	});
});
