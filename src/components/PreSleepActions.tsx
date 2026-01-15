import { Bed, Pill } from "lucide-react";
import type { PendingMedication } from "../types/sleep";

interface PreSleepActionsProps {
	pendingMedication: PendingMedication | null;
	onMedicationClick: () => void;
	onGoingToBed: () => void;
}

export function PreSleepActions({
	pendingMedication,
	onMedicationClick,
	onGoingToBed,
}: PreSleepActionsProps) {
	return (
		<div className="space-y-4 mb-16">
			<div className="flex justify-end">
				<button
					type="button"
					onClick={onMedicationClick}
					className={`flex items-center gap-2 rounded-full transition-colors ${
						pendingMedication
							? "bg-neutral-800 border border-neutral-700 px-4 py-2.5"
							: "bg-neutral-900 border border-neutral-700 hover:bg-neutral-850 p-2.5"
					}`}
				>
					<Pill
						className={`w-4 h-4 ${
							pendingMedication ? "text-neutral-200" : "text-neutral-400"
						}`}
						strokeWidth={1.5}
					/>
					{pendingMedication && (
						<span className="text-sm text-neutral-300 font-light tracking-wide">
							{pendingMedication.time}
						</span>
					)}
				</button>
			</div>

			<button
				type="button"
				onClick={onGoingToBed}
				className="w-full bg-neutral-900 border border-neutral-800 rounded-3xl p-12 hover:bg-neutral-850 transition-colors"
			>
				<div className="w-20 h-20 mx-auto mb-6 bg-neutral-800 rounded-full flex items-center justify-center">
					<Bed className="w-10 h-10 text-neutral-300" strokeWidth={1.5} />
				</div>
				<p className="text-lg font-light tracking-wide text-neutral-200">
					これから寝る
				</p>
			</button>
		</div>
	);
}
