import type { ScreenType } from "../types/screen";
import type { PendingBedTime } from "../types/sleep";
import { isAutoFormTime, isSleepingScreenTime } from "./timeUtils";

export function deriveScreen(
	pendingBedTime: PendingBedTime | null,
): ScreenType {
	if (!pendingBedTime) return "home";

	if (isAutoFormTime()) return "form";
	if (isSleepingScreenTime()) return "sleeping";

	return "home"; // 4:00-6:00, 16:00-22:00
}
