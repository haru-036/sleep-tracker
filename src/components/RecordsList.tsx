import { Bath, ChartNoAxesGantt, Coffee, Moon, Pill, Sun } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import type { SleepRecord } from "../types/sleep";

interface RecordsListProps {
	records: SleepRecord[];
	formatDate: (dateStr: string) => string;
	calculateSleepDuration: (
		bedDate: string,
		bedTime: string,
		wakeDate: string,
		wakeTime: string,
	) => string | null;
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
				<Card key={record.id}>
					<CardHeader>
						<CardTitle>{formatDate(record.wakeDate)}</CardTitle>
						<CardDescription>
							{calculateSleepDuration(
								record.bedDate,
								record.bedTime,
								record.wakeDate,
								record.wakeTime,
							)}
						</CardDescription>
					</CardHeader>

					<CardContent>
						<div className="flex items-center gap-8 text-sm">
							<div className="flex items-center gap-2 text-neutral-300">
								<Moon className="w-3.5 h-3.5" strokeWidth={1.5} />
								<span className="font-light tracking-wide">
									{record.bedTime}
								</span>
							</div>
							<div className="flex items-center gap-2 text-neutral-300">
								<Sun className="w-3.5 h-3.5" strokeWidth={1.5} />
								<span className="font-light tracking-wide">
									{record.wakeTime}
								</span>
							</div>
						</div>
					</CardContent>

					{(record.hasCaffeine || record.hasBath || record.hasMedication) && (
						<CardFooter className="flex gap-2">
							{record.hasCaffeine && (
								<Badge>
									<Coffee className="w-3 h-3" strokeWidth={1.5} />
									{record.caffeineTime && (
										<span className="ml-1">{record.caffeineTime}</span>
									)}
								</Badge>
							)}
							{record.hasBath && (
								<Badge>
									<Bath className="w-3 h-3" strokeWidth={1.5} />
								</Badge>
							)}
							{record.hasMedication && (
								<Badge>
									<Pill className="w-3 h-3" strokeWidth={1.5} />
									{record.medicationTime && (
										<span className="ml-1">{record.medicationTime}</span>
									)}
								</Badge>
							)}
						</CardFooter>
					)}
				</Card>
			))}
		</div>
	);
}
