import { Bar, BarChart, CartesianGrid, LabelList, XAxis, YAxis } from "recharts";
import { type ChartConfig, ChartContainer } from "@/components/ui/chart";
import type { SleepRecord } from "../types/sleep";

interface SleepChartProps {
	records: SleepRecord[];
}

const chartConfig = {
	grid: {
		color: "var(--muted)",
	},
	xaxis: {
		label: "Time (Hours)",
		color: "oklch(0.38 0 0)",
	},
	sleep: {
		label: "Sleep Duration",
		color: "var(--chart-1)",
	},
} satisfies ChartConfig;

function toDisplayMinutes(time: string) {
	const [h, m] = time.split(":").map(Number);
	let minutes = h * 60 + m;
	if (minutes < 22 * 60) {
		minutes += 24 * 60;
	}
	return minutes;
}

function formatMinutesToHour(minutes: number) {
	const total = minutes % (24 * 60);
	const h = Math.floor(total / 60);
	return `${String(h).padStart(2, "0")}`;
}

export function SleepChart({ records }: SleepChartProps) {
	if (records.length === 0) return null;

	const last7 = [...records]
		.sort((a, b) => b.wakeDate.localeCompare(a.wakeDate))
		.slice(0, 7);

	const chartData = last7.map((record) => ({
		date: String(Number(record.wakeDate.split("-")[2])),
		sleep: [
			toDisplayMinutes(record.wakeTime),
			toDisplayMinutes(record.bedTime),
		],
	}));

	return (
		<ChartContainer config={chartConfig} className="min-h-20 w-full mb-10">
			<BarChart
				accessibilityLayer
				data={chartData}
				layout="vertical"
				margin={{ left: 10 }}
			>
				<CartesianGrid horizontal={false} stroke="var(--color-grid)" />
				<YAxis
					type="category"
					dataKey="date"
					tickLine={false}
					tickMargin={8}
					axisLine={false}
					width={32}
					tick={{
						fontSize: 12,
						fontWeight: "300",
						fill: "oklch(0.46 0 0)",
					}}
				/>
				<XAxis
					type="number"
					orientation="top"
					domain={[1320, 2400]}
					tickFormatter={formatMinutesToHour}
					tickLine={false}
					axisLine={false}
					tick={{
						fontSize: 12,
						fontWeight: "300",
						fill: "oklch(0.46 0 0)",
					}}
					ticks={[
						22 * 60,
						25 * 60,
						28 * 60,
						31 * 60,
						34 * 60,
						37 * 60,
						40 * 60,
					]}
				/>
				<Bar
					layout="vertical"
					dataKey="sleep"
					fill="var(--color-sleep)"
					radius={6}
					barSize={16}
					isAnimationActive={false}
				/>
			</BarChart>
		</ChartContainer>
	);
}
