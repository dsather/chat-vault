import { PLATFORM_CONFIG, type Platform } from "../lib/constants";

export function detectPlatform(): Platform | null {
	const hostname = window.location.hostname;
	const pathname = window.location.pathname;

	for (const [platform, config] of Object.entries(PLATFORM_CONFIG)) {
		for (const domain of config.domains) {
			if (hostname === domain || hostname.endsWith(`.${domain}`)) {
				if (platform === "grok-x" && !pathname.startsWith("/i/grok")) {
					continue;
				}
				return platform as Platform;
			}
		}
	}
	return null;
}
