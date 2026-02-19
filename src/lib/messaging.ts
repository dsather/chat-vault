import { defineExtensionMessaging } from "@webext-core/messaging";

export interface DetectResponse {
	platform: string;
	supported: boolean;
}

export interface ExtractResponse {
	success: boolean;
	json?: string;
	markdown?: string;
	turnCount: number;
	errors: string[];
	warnings: string[];
	durationMs: number;
}

export interface DownloadRequest {
	content: string;
	filename: string;
	mimeType: string;
}

interface ProtocolMap {
	detect(): DetectResponse | null;
	extract(data: { format: "json" | "markdown" | "both" }): ExtractResponse;
	download(data: DownloadRequest): { success: boolean };
}

export const { sendMessage, onMessage } = defineExtensionMessaging<ProtocolMap>();
