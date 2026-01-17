import { Bed, RotateCw, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { PendingBedTime } from "../types/sleep";

interface SleepWaitingScreenProps {
	pendingBedTime: PendingBedTime;
	minutesUntilBed: number;
	onClose: () => void;
	onRefresh: () => void;
	onTimeChange: (value: string) => void;
	onWakeUp: () => void;
}

export function SleepWaitingScreen({
	pendingBedTime,
	minutesUntilBed,
	onClose,
	onRefresh,
	onTimeChange,
	onWakeUp,
}: SleepWaitingScreenProps) {
	if (!pendingBedTime) return null;

	return (
		<div className="fixed inset-0 bg-neutral-950 z-50 flex flex-col">
			<Button
				variant="ghost"
				size="icon"
				onClick={onClose}
				className="absolute top-5 right-5 text-neutral-500 hover:text-neutral-200"
			>
				<X className="size-6" strokeWidth={1.5} />
			</Button>

			<div className="flex-1 flex flex-col items-center justify-center p-8 space-y-10">
				<div className="text-center space-y-3">
					<h2 className="text-2xl font-light text-neutral-300 tracking-wider">
						おやすみなさい
					</h2>
				</div>

				<div className="w-full max-w-sm">
					<div className="bg-neutral-900/70 backdrop-blur-sm rounded-3xl p-10 text-center space-y-6 border border-neutral-800/50">
						<div className="w-24 h-24 mx-auto bg-neutral-800 rounded-full flex items-center justify-center">
							<Bed className="size-12 text-neutral-400" strokeWidth={1.5} />
						</div>

						<div className="space-y-1">
							<p className="text-neutral-400 text-xs tracking-wide">就寝時間</p>
							<input
								type="time"
								className="text-5xl font-light text-neutral-300 tracking-tight text-center h-18"
								value={pendingBedTime.time}
								onChange={(event) => onTimeChange(event.target.value)}
							/>
							<p className="text-neutral-500 text-xs">
								({minutesUntilBed}分後)
							</p>
							<Button
								variant="ghost"
								size="icon-sm"
								className="mt-1 text-neutral-400 hover:text-neutral-200"
								onClick={onRefresh}
							>
								<RotateCw size={16} />
							</Button>
						</div>
					</div>
				</div>

				<Button
					variant="secondary"
					className="w-full max-w-sm py-4 border border-neutral-700 text-neutral-300"
					onClick={onWakeUp}
				>
					記録を入力
				</Button>
			</div>
		</div>
	);
}
