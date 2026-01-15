import { Bed } from "lucide-react";

interface PreSleepActionsProps {
	onGoingToBed: () => void;
}

export function PreSleepActions({ onGoingToBed }: PreSleepActionsProps) {
	return (
		<div className="space-y-4 mb-16">
			<button
				type="button"
				onClick={onGoingToBed}
				className="w-full bg-neutral-900 border border-neutral-800 rounded-3xl p-12 hover:bg-neutral-850 transition-colors"
			>
				<div className="w-20 h-20 mx-auto mb-6 bg-neutral-800 rounded-full flex items-center justify-center">
					<Bed className="w-10 h-10 text-neutral-400" strokeWidth={1.5} />
				</div>
				<p className="text-lg font-light tracking-wide text-neutral-300">
					これから寝る
				</p>
			</button>
		</div>
	);
}
