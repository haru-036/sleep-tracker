import { Bath, ChartNoAxesGantt, Coffee, Moon, Pill, Sun } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { SleepRecord } from "../types/sleep";

interface RecordsListProps {
	records: SleepRecord[];
	formatDate: (dateStr: string) => string;
	onEditRecord: (record: SleepRecord) => void;
	onExport: () => void;
}

function durationMinutes(
	bedDate: string,
	bedTime: string,
	wakeDate: string,
	wakeTime: string,
): number | null {
	if (!bedDate || !bedTime || !wakeDate || !wakeTime) return null;
	const bed = new Date(`${bedDate}T${bedTime}:00`);
	const wake = new Date(`${wakeDate}T${wakeTime}:00`);
	const totalMinutes = Math.floor((wake.getTime() - bed.getTime()) / 60000);
	return totalMinutes > 0 ? totalMinutes : null;
}

function formatHoursDecimal(totalMinutes: number): string {
	const hours = Math.round((totalMinutes / 60) * 10) / 10;
	return `${hours}h`;
}

function groupByWakeDate(records: SleepRecord[]): [string, SleepRecord[]][] {
	const groups = new Map<string, SleepRecord[]>();
	for (const record of records) {
		const group = groups.get(record.wakeDate);
		if (group) {
			group.push(record);
		} else {
			groups.set(record.wakeDate, [record]);
		}
	}
	for (const group of groups.values()) {
		group.sort((a, b) =>
			`${a.bedDate}T${a.bedTime}`.localeCompare(`${b.bedDate}T${b.bedTime}`),
		);
	}
	return [...groups.entries()];
}

export function RecordsList({
	records,
	formatDate,
	onEditRecord,
	onExport,
}: RecordsListProps) {
	if (records.length === 0) {
		return (
			<div className="text-center py-16 text-neutral-600">
				<div className="w-16 h-16 mx-auto mb-4 bg-neutral-900 border border-neutral-800 rounded-full flex items-center justify-center">
					<ChartNoAxesGantt
						className="w-8 h-8 text-neutral-700"
						strokeWidth={1.5}
					/>
				</div>
				<p className="text-sm tracking-wide">記録はまだありません</p>
			</div>
		);
	}

	return (
		<div className="divide-y divide-neutral-800/60">
			{groupByWakeDate(records).map(([wakeDate, dayRecords]) => {
				const totalMinutes = dayRecords.reduce((sum, record) => {
					const minutes = durationMinutes(
						record.bedDate,
						record.bedTime,
						record.wakeDate,
						record.wakeTime,
					);
					return sum + (minutes ?? 0);
				}, 0);

				return (
					<div key={wakeDate} className="py-2">
						<div className="flex items-center px-3 pt-3">
							<span className="text-xs text-neutral-600 tracking-wide">
								{formatDate(wakeDate)}
							</span>
							{dayRecords.length > 1 && totalMinutes > 0 && (
								<span className="text-xs text-neutral-600 font-light tracking-wide ml-auto">
									計 {formatHoursDecimal(totalMinutes)}
								</span>
							)}
						</div>

						{dayRecords.map((record) => {
							const minutes = durationMinutes(
								record.bedDate,
								record.bedTime,
								record.wakeDate,
								record.wakeTime,
							);
							const hasBadges =
								record.hasCaffeine || record.hasBath || record.hasMedication;

							return (
								<button
									key={record.id}
									type="button"
									onClick={() => onEditRecord(record)}
									className="flex flex-col gap-2 w-full text-left py-3 px-3 transition-colors hover:bg-neutral-900/40"
								>
									<div className="flex items-center gap-3">
										<div className="flex items-center gap-1.5 text-neutral-300 text-sm font-light tracking-wide shrink-0">
											<Moon className="w-3 h-3 shrink-0" strokeWidth={1.5} />
											<span>{record.bedTime}</span>
										</div>
										<div className="flex items-center gap-1.5 text-neutral-300 text-sm font-light tracking-wide shrink-0">
											<Sun className="w-3 h-3 shrink-0" strokeWidth={1.5} />
											<span>{record.wakeTime}</span>
										</div>
										{minutes !== null && (
											<span className="text-xs text-neutral-600 font-light tracking-wide ml-auto">
												{formatHoursDecimal(minutes)}
											</span>
										)}
									</div>

									{hasBadges && (
										<div className="flex items-center gap-1.5">
											{record.hasCaffeine && (
												<Badge>
													<Coffee strokeWidth={1.5} />
													{record.caffeineTime && (
														<span>{record.caffeineTime}</span>
													)}
												</Badge>
											)}
											{record.hasBath && (
												<Badge>
													<Bath strokeWidth={1.5} />
												</Badge>
											)}
											{record.hasMedication && (
												<Badge>
													<Pill strokeWidth={1.5} />
													{record.medicationTime && (
														<span>{record.medicationTime}</span>
													)}
												</Badge>
											)}
										</div>
									)}
								</button>
							);
						})}
					</div>
				);
			})}
			<div className="py-8 flex justify-center">
				<button
					type="button"
					onClick={onExport}
					className="text-xs text-neutral-700 hover:text-neutral-500 tracking-wide"
				>
					エクスポート
				</button>
			</div>
		</div>
	);
}
