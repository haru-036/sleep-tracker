export function calculateSleepDuration(
	bedDate: string,
	bedTime: string,
	wakeDate: string,
	wakeTime: string,
): string | null {
	if (!bedDate || !bedTime || !wakeDate || !wakeTime) return null;

	const bedDateTime = new Date(`${bedDate}T${bedTime}:00`);
	const wakeDateTime = new Date(`${wakeDate}T${wakeTime}:00`);

	const durationMs = wakeDateTime.getTime() - bedDateTime.getTime();
	const durationMinutes = Math.floor(durationMs / (1000 * 60));

	const hours = Math.floor(durationMinutes / 60);
	const minutes = durationMinutes % 60;

	return `${hours}h ${minutes}m`;
}
