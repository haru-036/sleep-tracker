export function formatDate(dateStr: string): string {
	const date = new Date(dateStr);
	const jstDate = new Date(
		date.toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" }),
	);
	const month = jstDate.getMonth() + 1;
	const day = jstDate.getDate();
	return `${month}/${day}`;
}

export function formatDateFull(dateStr: string): string {
	const date = new Date(dateStr);
	const jstDate = new Date(
		date.toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" }),
	);
	const month = jstDate.getMonth() + 1;
	const day = jstDate.getDate();
	const weekdays = ["日", "月", "火", "水", "木", "金", "土"];
	const weekday = weekdays[jstDate.getDay()];
	return `${month}月${day}日 (${weekday})`;
}
