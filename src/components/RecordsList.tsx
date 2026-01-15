import { Bath, ChartNoAxesGantt, Coffee, Moon, Pill, Sun } from "lucide-react";
import type { SleepRecord } from "../types/sleep";

interface RecordsListProps {
	records: SleepRecord[];
	formatDate: (dateStr: string) => string;
	calculateSleepDuration: (bedTime: string, wakeTime: string) => string | null;
}

export function RecordsList({
	records,
	formatDate,
	calculateSleepDuration,
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
		<div className="space-y-3">
			{records.map((record) => (
				<div
					key={record.id}
					className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6"
				>
					<div className="flex items-center justify-between mb-4">
						<p className="text-sm text-neutral-400 tracking-wide">
							{formatDate(record.date)}
						</p>
						<span className="text-xs text-neutral-500 tracking-wide">
							{calculateSleepDuration(record.bedTime, record.wakeTime)}
						</span>
					</div>

					<div className="flex items-center gap-8 text-sm">
						<div className="flex items-center gap-2 text-neutral-300">
							<Moon className="w-3.5 h-3.5" strokeWidth={1.5} />
							<span className="font-light tracking-wide">{record.bedTime}</span>
						</div>
						<div className="flex items-center gap-2 text-neutral-300">
							<Sun className="w-3.5 h-3.5" strokeWidth={1.5} />
							<span className="font-light tracking-wide">
								{record.wakeTime}
							</span>
						</div>
					</div>

					{(record.hasCaffeine || record.hasBath || record.hasMedication) && (
						<div className="flex gap-2 mt-3">
							{record.hasCaffeine && (
								<span className="inline-flex items-center gap-1 text-xs bg-neutral-800 text-neutral-400 px-2 py-1 rounded-full">
									<Coffee className="w-3 h-3" strokeWidth={1.5} />
								</span>
							)}
							{record.hasBath && (
								<span className="inline-flex items-center gap-1 text-xs bg-neutral-800 text-neutral-400 px-2 py-1 rounded-full">
									<Bath className="w-3 h-3" strokeWidth={1.5} />
								</span>
							)}
							{record.hasMedication && (
								<span className="inline-flex items-center gap-1 text-xs bg-neutral-800 text-neutral-400 px-2 py-1 rounded-full">
									<Pill className="w-3 h-3" strokeWidth={1.5} />
									{record.medicationTime && (
										<span className="ml-1">{record.medicationTime}</span>
									)}
								</span>
							)}
						</div>
					)}
				</div>
			))}
		</div>
	);
}
