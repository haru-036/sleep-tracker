import type {
	PendingBedTime,
	PendingCaffeine,
	PendingMedication,
	SleepRecord,
} from "../types/sleep";

const SLEEP_PREFIX = "sleep:";
const PENDING_BED_KEY = "pending-bed-time";
const PENDING_MED_KEY = "pending-medication";
const PENDING_CAFFEINE_KEY = "pending-caffeine";

function hasStorage(): boolean {
	return (
		typeof window !== "undefined" && typeof window.localStorage !== "undefined"
	);
}

export function loadSleepRecords(): SleepRecord[] {
	if (!hasStorage()) return [];

	const records: SleepRecord[] = [];
	try {
		for (let i = 0; i < window.localStorage.length; i += 1) {
			const key = window.localStorage.key(i);
			if (!key || !key.startsWith(SLEEP_PREFIX)) continue;

			const raw = window.localStorage.getItem(key);
			if (!raw) continue;

			try {
				const parsed = JSON.parse(raw) as SleepRecord;
				records.push(parsed);
			} catch {
				// ignore broken record
			}
		}
	} catch {
		return [];
	}

	// 新しい日付が上に来るようにソート
	return records.sort(
		(a, b) => new Date(b.wakeDate).getTime() - new Date(a.wakeDate).getTime(),
	);
}

export function saveSleepRecord(record: SleepRecord): void {
	if (!hasStorage()) return;
	try {
		window.localStorage.setItem(
			`${SLEEP_PREFIX}${record.wakeDate}`,
			JSON.stringify(record),
		);
	} catch {
		// ignore
	}
}

export function removeSleepRecord(wakeDate: string): void {
	if (!hasStorage()) return;
	try {
		window.localStorage.removeItem(`${SLEEP_PREFIX}${wakeDate}`);
	} catch {
		// ignore
	}
}

export function loadPendingBedTime(): PendingBedTime | null {
	if (!hasStorage()) return null;
	try {
		const raw = window.localStorage.getItem(PENDING_BED_KEY);
		if (!raw) return null;
		return JSON.parse(raw) as PendingBedTime;
	} catch {
		return null;
	}
}

export function savePendingBedTime(value: PendingBedTime): void {
	if (!hasStorage()) return;
	try {
		window.localStorage.setItem(PENDING_BED_KEY, JSON.stringify(value));
	} catch {
		// ignore
	}
}

export function clearPendingBedTime(): void {
	if (!hasStorage()) return;
	try {
		window.localStorage.removeItem(PENDING_BED_KEY);
	} catch {
		// ignore
	}
}

export function loadPendingMedication(): PendingMedication | null {
	if (!hasStorage()) return null;
	try {
		const raw = window.localStorage.getItem(PENDING_MED_KEY);
		if (!raw) return null;
		return JSON.parse(raw) as PendingMedication;
	} catch {
		return null;
	}
}

export function savePendingMedication(value: PendingMedication): void {
	if (!hasStorage()) return;
	try {
		window.localStorage.setItem(PENDING_MED_KEY, JSON.stringify(value));
	} catch {
		// ignore
	}
}

export function clearPendingMedication(): void {
	if (!hasStorage()) return;
	try {
		window.localStorage.removeItem(PENDING_MED_KEY);
	} catch {
		// ignore
	}
}

export function loadPendingCaffeine(): PendingCaffeine | null {
	if (!hasStorage()) return null;
	try {
		const raw = window.localStorage.getItem(PENDING_CAFFEINE_KEY);
		if (!raw) return null;
		return JSON.parse(raw) as PendingCaffeine;
	} catch {
		return null;
	}
}

export function savePendingCaffeine(value: PendingCaffeine): void {
	if (!hasStorage()) return;
	try {
		window.localStorage.setItem(PENDING_CAFFEINE_KEY, JSON.stringify(value));
	} catch {
		// ignore
	}
}

export function clearPendingCaffeine(): void {
	if (!hasStorage()) return;
	try {
		window.localStorage.removeItem(PENDING_CAFFEINE_KEY);
	} catch {
		// ignore
	}
}
