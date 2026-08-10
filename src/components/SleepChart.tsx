import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import type { SleepRecord } from "../types/sleep";
import { formatDate } from "../utils/dateFormat";
import { getLocalDateString } from "../utils/timeUtils";

interface SleepChartProps {
	records: SleepRecord[];
}

// 時間軸のドメイン（分）。22:00(1320) 〜 翌16:00(2400)
const DOMAIN_MIN = 22 * 60;
const DOMAIN_MAX = 40 * 60;
const DOMAIN_SPAN = DOMAIN_MAX - DOMAIN_MIN;

// 3時間ごとの目盛り
const TICKS = [22, 25, 28, 31, 34, 37, 40].map((h) => h * 60);

const DAYS = 7;

const TICK_COLOR = "oklch(0.46 0 0)";

type Segment = [number, number]; // [bedMin, wakeMin]

function toDisplayMinutes(time: string) {
	const [h, m] = time.split(":").map(Number);
	let minutes = h * 60 + m;
	if (minutes < DOMAIN_MIN) {
		minutes += 24 * 60;
	}
	return minutes;
}

function formatTick(minutes: number) {
	const h = Math.floor((minutes % (24 * 60)) / 60);
	return String(h).padStart(2, "0");
}

// ドメイン上の分を 0〜100% に変換（範囲外はクランプ）
function toPercent(minutes: number) {
	const pct = ((minutes - DOMAIN_MIN) / DOMAIN_SPAN) * 100;
	return Math.min(100, Math.max(0, pct));
}

// 指定日から過去 DAYS 日分の日付文字列（新しい順）
function windowDates(end: Date): string[] {
	const dates: string[] = [];
	for (let i = 0; i < DAYS; i += 1) {
		const d = new Date(end);
		d.setDate(d.getDate() - i);
		dates.push(getLocalDateString(d));
	}
	return dates;
}

export function SleepChart({ records }: SleepChartProps) {
	// 0 = 今日を含む直近7日。1つ進むごとに1週間過去へ
	const [weekOffset, setWeekOffset] = useState(0);

	if (records.length === 0) return null;

	// 起床日ごとに睡眠セグメントをまとめる（同じ日の複数記録は同じ行に並べる）
	const byDate = new Map<string, Segment[]>();
	let oldestDate = records[0].wakeDate;
	for (const record of records) {
		const bed = toDisplayMinutes(record.bedTime);
		const wake = toDisplayMinutes(record.wakeTime);
		const segments = byDate.get(record.wakeDate);
		if (segments) {
			segments.push([bed, wake]);
		} else {
			byDate.set(record.wakeDate, [[bed, wake]]);
		}
		if (record.wakeDate < oldestDate) {
			oldestDate = record.wakeDate;
		}
	}

	const end = new Date();
	end.setDate(end.getDate() - weekOffset * DAYS);
	const dates = windowDates(end);

	// 記録のない日も空行として並べ、7行=7日を保つ
	const rows = dates.map((date) => ({
		date,
		day: String(Number(date.split("-")[2])),
		segments: byDate.get(date) ?? [],
	}));

	// 最古の記録を含む週まで遡れる
	const canGoBack = oldestDate < dates[DAYS - 1];
	const canGoForward = weekOffset > 0;

	return (
		<div
			className="w-full mb-10 text-xs font-light pr-2"
			style={{ color: TICK_COLOR }}
		>
			{/* 上部の時間軸ラベル（左の日付ガターぶんだけ右にずらす） */}
			<div className="pl-8 mb-1">
				<div className="relative h-4">
					{TICKS.map((t) => (
						<span
							key={t}
							className="absolute -translate-x-1/2 whitespace-nowrap"
							style={{ left: `${toPercent(t)}%` }}
						>
							{formatTick(t)}
						</span>
					))}
				</div>
			</div>

			{/* 本体 */}
			<div className="relative">
				{/* 縦グリッド線（トラック領域全体に連続して引く） */}
				<div className="absolute top-0 bottom-0 left-8 right-0 pointer-events-none">
					{TICKS.map((t) => (
						<div
							key={t}
							className="absolute top-0 bottom-0 w-px bg-muted"
							style={{ left: `${toPercent(t)}%` }}
						/>
					))}
				</div>

				{/* 行 */}
				{rows.map((row) => (
					<div key={row.date} className="flex items-center h-7">
						<div className="w-7 shrink-0 pr-2 text-right">{row.day}</div>
						<div className="relative flex-1 h-4">
							{row.segments.map(([bed, wake], i) => {
								const left = toPercent(bed);
								const width = toPercent(wake) - left;
								return (
									<div
										// biome-ignore lint/suspicious/noArrayIndexKey: order is stable
										key={i}
										className="absolute top-0 h-4 rounded-sm bg-chart-1"
										style={{
											left: `${left}%`,
											width: `${Math.max(width, 0)}%`,
										}}
									/>
								);
							})}
						</div>
					</div>
				))}
			</div>

			{/* 週送り。過去を見ているときだけ期間を表示する */}
			<div className="flex items-center justify-end mt-1">
				{weekOffset > 0 && (
					<span className="mr-2 tracking-wide">
						{formatDate(dates[DAYS - 1])} – {formatDate(dates[0])}
					</span>
				)}
				<button
					type="button"
					disabled={!canGoBack}
					onClick={() => setWeekOffset((o) => o + 1)}
					className="p-2 text-neutral-600 hover:text-neutral-400 disabled:opacity-30 disabled:hover:text-neutral-600"
					aria-label="前の週"
				>
					<ChevronLeft className="w-4 h-4" strokeWidth={1.5} />
				</button>
				<button
					type="button"
					disabled={!canGoForward}
					onClick={() => setWeekOffset((o) => o - 1)}
					className="p-2 text-neutral-600 hover:text-neutral-400 disabled:opacity-30 disabled:hover:text-neutral-600"
					aria-label="次の週"
				>
					<ChevronRight className="w-4 h-4" strokeWidth={1.5} />
				</button>
			</div>
		</div>
	);
}
