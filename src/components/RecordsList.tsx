import { Bath, ChartNoAxesGantt, Coffee, Moon, Pill, Sun } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { SleepRecord } from "../types/sleep";

interface RecordsListProps {
	records: SleepRecord[];
	formatDate: (dateStr: string) => string;
	onEditRecord: (record: SleepRecord) => void;
	onExport: () => void;
}

// 起床日ごとにまとめる。records は wakeDate 降順ソート済み前提
function groupByWakeDate(
	records: SleepRecord[],
): { wakeDate: string; records: SleepRecord[] }[] {
	const groups: { wakeDate: string; records: SleepRecord[] }[] = [];
	for (const record of records) {
		const last = groups[groups.length - 1];
		if (last && last.wakeDate === record.wakeDate) {
			last.records.push(record);
		} else {
			groups.push({ wakeDate: record.wakeDate, records: [record] });
		}
	}
	// 同日内は就寝時刻の昇順（夜の睡眠 → 昼寝の順）
	for (const group of groups) {
		group.records.sort((a, b) =>
			`${a.bedDate}T${a.bedTime}`.localeCompare(`${b.bedDate}T${b.bedTime}`),
		);
	}
	return groups;
}

function durationMinutes(record: SleepRecord): number | null {
	const { bedDate, bedTime, wakeDate, wakeTime } = record;
	if (!bedDate || !bedTime || !wakeDate || !wakeTime) return null;
	const bed = new Date(`${bedDate}T${bedTime}:00`);
	const wake = new Date(`${wakeDate}T${wakeTime}:00`);
	const totalMinutes = Math.floor((wake.getTime() - bed.getTime()) / 60000);
	return totalMinutes > 0 ? totalMinutes : null;
}

function formatHours(minutes: number): string {
	const hours = Math.round((minutes / 60) * 10) / 10;
	return `${hours}h`;
}

interface RecordRowProps {
	record: SleepRecord;
	// 単一記録の日は行内に日付を出す。複数記録の日は日付列をグループ側が持つ
	dateLabel?: string;
	compact?: boolean;
	onClick: () => void;
}

function RecordRow({ record, dateLabel, compact, onClick }: RecordRowProps) {
	const minutes = durationMinutes(record);
	const hasBadges =
		record.hasCaffeine || record.hasBath || record.hasMedication;

	return (
		<button
			type="button"
			onClick={onClick}
			className={`flex flex-col gap-2 w-full text-left transition-colors hover:bg-neutral-900/40 ${
				compact ? "py-3 pr-3 pl-3" : "py-5 px-3"
			}`}
		>
			<div className="flex items-center gap-3">
				{dateLabel !== undefined && (
					<span className="text-xs text-neutral-600 tracking-wide w-10 shrink-0">
						{dateLabel}
					</span>
				)}
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
						{formatHours(minutes)}
					</span>
				)}
			</div>

			{hasBadges && (
				<div className={`flex items-center gap-1.5 ${compact ? "" : "ml-12"}`}>
					{record.hasCaffeine && (
						<Badge>
							<Coffee strokeWidth={1.5} />
							{record.caffeineTime && <span>{record.caffeineTime}</span>}
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
							{record.medicationTime && <span>{record.medicationTime}</span>}
						</Badge>
					)}
				</div>
			)}
		</button>
	);
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

	const groups = groupByWakeDate(records);

	return (
		<div className="divide-y divide-neutral-800/60">
			{groups.map((group) => {
				// 単一記録の日は従来どおりの1行表示
				if (group.records.length === 1) {
					const record = group.records[0];
					return (
						<RecordRow
							key={record.id}
							record={record}
							dateLabel={formatDate(record.wakeDate)}
							onClick={() => onEditRecord(record)}
						/>
					);
				}

				// 複数記録の日: 日付列に日付とその日の合計を縦に置き、右に記録行を積む
				const totalMinutes = group.records.reduce(
					(sum, r) => sum + (durationMinutes(r) ?? 0),
					0,
				);

				return (
					<div key={group.wakeDate} className="flex pl-3">
						<div className="w-10 shrink-0 pt-3 flex flex-col gap-1">
							<span className="text-xs text-neutral-600 tracking-wide">
								{formatDate(group.wakeDate)}
							</span>
							{totalMinutes > 0 && (
								<span className="text-xs text-neutral-500 font-light tracking-wide">
									{formatHours(totalMinutes)}
								</span>
							)}
						</div>
						<div className="flex-1 min-w-0">
							{group.records.map((record) => (
								<RecordRow
									key={record.id}
									record={record}
									compact
									onClick={() => onEditRecord(record)}
								/>
							))}
						</div>
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
