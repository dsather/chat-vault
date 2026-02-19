import { SAFETY_LIMITS } from "./constants";

export function wait(ms: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

export function findActionButton(
	container: Element,
	selectors: string[],
): HTMLButtonElement | null {
	for (const selector of selectors) {
		const button = container.querySelector<HTMLButtonElement>(selector);
		if (button) return button;
	}
	return null;
}

export async function clickCopyAndRead(button: HTMLButtonElement): Promise<string | null> {
	button.click();
	await wait(SAFETY_LIMITS.CLIPBOARD_READ_DELAY_MS);

	try {
		const text = await navigator.clipboard.readText();
		return text || null;
	} catch {
		return null;
	}
}

export async function scrollToLoadAll(
	container: HTMLElement,
	getTurnCount: () => number,
): Promise<void> {
	let stableCount = 0;
	let lastCount = getTurnCount();

	for (let i = 0; i < SAFETY_LIMITS.MAX_SCROLL_ITERATIONS; i++) {
		container.scrollTop = 0;
		await wait(SAFETY_LIMITS.SCROLL_STEP_DELAY_MS);

		const currentCount = getTurnCount();
		if (currentCount === lastCount) {
			stableCount++;
			if (stableCount >= SAFETY_LIMITS.SCROLL_STABILITY_THRESHOLD) break;
		} else {
			stableCount = 0;
			lastCount = currentCount;
		}
	}

	container.scrollTop = container.scrollHeight;
	await wait(SAFETY_LIMITS.SCROLL_STEP_DELAY_MS);
}

export function getTextContent(element: Element): string {
	return element.textContent?.trim() ?? "";
}
