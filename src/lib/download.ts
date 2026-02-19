import { sendMessage } from "./messaging";

export async function downloadFile(
	content: string,
	filename: string,
	mimeType: string,
): Promise<boolean> {
	try {
		const result = await sendMessage("download", { content, filename, mimeType });
		return result.success;
	} catch {
		return downloadViaBlob(content, filename, mimeType);
	}
}

function downloadViaBlob(content: string, filename: string, mimeType: string): boolean {
	try {
		const blob = new Blob([content], { type: mimeType });
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = filename;
		a.style.display = "none";
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
		return true;
	} catch {
		return false;
	}
}
