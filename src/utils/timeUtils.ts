// 6:00-16:00 → 記録フォーム時間帯
export function isAutoFormTime(date = new Date()): boolean {
	const hour = date.getHours();
	return hour >= 6 && hour < 16;
}

// 22:00-4:00 → 就寝待機画面時間帯
export function isSleepingScreenTime(date = new Date()): boolean {
	const hour = date.getHours();
	return hour >= 22 || hour < 4;
}

// ローカル時間の日付文字列を取得（YYYY-MM-DD）
export function getLocalDateString(date = new Date()): string {
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, "0");
	const day = String(date.getDate()).padStart(2, "0");
	return `${year}-${month}-${day}`;
}
