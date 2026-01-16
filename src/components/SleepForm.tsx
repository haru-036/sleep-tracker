import { Bath, Circle, Coffee, Moon, Pill, Sun, X } from "lucide-react";
import type { FormEvent } from "react";
import type { SleepRecordInput } from "../types/sleep";

interface SleepFormProps {
	currentRecord: SleepRecordInput;
	onChange: (record: SleepRecordInput) => void;
	onSubmit: (event: FormEvent<HTMLFormElement>) => void;
	onCancel: () => void;
	onMedicationTimeClick: () => void;
	onCaffeineTimeClick: () => void;
}

export function SleepForm({
	currentRecord,
	onChange,
	onSubmit,
	onCancel,
	onMedicationTimeClick,
	onCaffeineTimeClick,
}: SleepFormProps) {
	const updateRecord = (updates: Partial<SleepRecordInput>) => {
		onChange({ ...currentRecord, ...updates });
	};

	const handleMedicationTimeClick = () => {
		if (currentRecord.hasMedication) {
			onMedicationTimeClick();
		}
	};

	const handleCaffeineTimeClick = () => {
		if (currentRecord.hasCaffeine) {
			onCaffeineTimeClick();
		}
	};

	return (
		<div className="mb-16">
			<form onSubmit={onSubmit} className="space-y-8">
				<div className="grid grid-cols-2 gap-6">
					<div className="space-y-3">
						<label
							htmlFor="bed-time-input"
							className="flex items-center gap-2 text-xs text-neutral-400 tracking-wide"
						>
							<Moon className="w-3.5 h-3.5" strokeWidth={1.5} />
							就寝
						</label>
						<input
							id="bed-time-input"
							type="time"
							value={currentRecord.bedTime}
							onChange={(event) =>
								updateRecord({ bedTime: event.target.value })
							}
							className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 text-neutral-100 rounded-2xl focus:border-neutral-600 focus:outline-none text-lg font-light appearance-none [-webkit-appearance:none]"
							style={{ boxSizing: "border-box" }}
							required
						/>
					</div>

					<div className="space-y-3">
						<label
							htmlFor="wake-time-input"
							className="flex items-center gap-2 text-xs text-neutral-400 tracking-wide"
						>
							<Sun className="w-3.5 h-3.5" strokeWidth={1.5} />
							起床
						</label>
						<input
							id="wake-time-input"
							type="time"
							value={currentRecord.wakeTime}
							onChange={(event) =>
								updateRecord({ wakeTime: event.target.value })
							}
							className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 text-neutral-100 rounded-2xl focus:border-neutral-600 focus:outline-none text-lg font-light appearance-none [-webkit-appearance:none]"
							style={{ boxSizing: "border-box" }}
							required
						/>
					</div>
				</div>

				<div className="space-y-6">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-3">
							<div className="flex items-center gap-2">
								<Coffee
									className="w-4 h-4 text-neutral-300"
									strokeWidth={1.5}
								/>
								<span className="text-sm text-neutral-300 tracking-wide">
									コーヒー
								</span>
							</div>
							<button
								type="button"
								onClick={handleCaffeineTimeClick}
								className={`text-sm tracking-wide transition-colors ${
									currentRecord.hasCaffeine
										? "text-neutral-300 hover:text-neutral-100"
										: "text-neutral-600"
								}`}
							>
								{currentRecord.caffeineTime || "--:--"}
							</button>
						</div>
						<div className="flex gap-2">
							<button
								type="button"
								onClick={() => updateRecord({ hasCaffeine: false })}
								className={`w-10 h-10 rounded-full transition-colors flex items-center justify-center ${
									!currentRecord.hasCaffeine
										? "bg-neutral-700 border border-neutral-600 text-neutral-100"
										: "bg-neutral-850 border border-neutral-800 text-neutral-500 hover:border-neutral-700"
								}`}
							>
								<X className="size-4" strokeWidth={1.5} />
							</button>
							<button
								type="button"
								onClick={() => updateRecord({ hasCaffeine: true })}
								className={`w-10 h-10 rounded-full transition-colors flex items-center justify-center ${
									currentRecord.hasCaffeine
										? "bg-neutral-700 border border-neutral-600 text-neutral-100"
										: "bg-neutral-850 border border-neutral-800 text-neutral-500 hover-border-neutral-700"
								}`}
							>
								<Circle className="size-4" strokeWidth={1.5} />
							</button>
						</div>
					</div>

					<div className="flex items-center justify-between">
						<label
							htmlFor="bath-input"
							className="flex items-center gap-2 text-sm text-neutral-300 tracking-wide"
						>
							<Bath className="w-4 h-4" strokeWidth={1.5} />
							お風呂
						</label>
						<div className="flex gap-2">
							<button
								type="button"
								onClick={() => updateRecord({ hasBath: false })}
								className={`w-10 h-10 rounded-full transition-colors flex items-center justify-center ${
									!currentRecord.hasBath
										? "bg-neutral-700 border border-neutral-600 text-neutral-100"
										: "bg-neutral-850 border border-neutral-800 text-neutral-500 hover-border-neutral-700"
								}`}
							>
								<X className="size-4" strokeWidth={1.5} />
							</button>
							<button
								type="button"
								onClick={() => updateRecord({ hasBath: true })}
								className={`w-10 h-10 rounded-full transition-colors flex items-center justify-center ${
									currentRecord.hasBath
										? "bg-neutral-700 border border-neutral-600 text-neutral-100"
										: "bg-neutral-850 border border-neutral-800 text-neutral-500 hover-border-neutral-700"
								}`}
							>
								<Circle className="size-4" strokeWidth={1.5} />
							</button>
						</div>
					</div>

					<div className="flex items-center justify-between">
						<div className="flex items-center gap-3">
							<div className="flex items-center gap-2">
								<Pill className="w-4 h-4 text-neutral-300" strokeWidth={1.5} />
								<span className="text-sm text-neutral-300 tracking-wide">
									眠剤
								</span>
							</div>
							<button
								type="button"
								onClick={handleMedicationTimeClick}
								className={`text-sm tracking-wide transition-colors ${
									currentRecord.hasMedication
										? "text-neutral-300 hover:text-neutral-100"
										: "text-neutral-600"
								}`}
							>
								{currentRecord.medicationTime || "--:--"}
							</button>
						</div>
						<div className="flex gap-2">
							<button
								type="button"
								onClick={() => updateRecord({ hasMedication: false })}
								className={`w-10 h-10 rounded-full transition-colors flex items-center justify-center ${
									!currentRecord.hasMedication
										? "bg-neutral-700 border border-neutral-600 text-neutral-100"
										: "bg-neutral-850 border border-neutral-800 text-neutral-500 hover-border-neutral-700"
								}`}
							>
								<X className="size-4" strokeWidth={1.5} />
							</button>
							<button
								type="button"
								onClick={() => updateRecord({ hasMedication: true })}
								className={`w-10 h-10 rounded-full transition-colors flex items-center justify-center ${
									currentRecord.hasMedication
										? "bg-neutral-700 border border-neutral-600 text-neutral-100"
										: "bg-neutral-850 border border-neutral-800 text-neutral-500 hover-border-neutral-700"
								}`}
							>
								<Circle className="size-4" strokeWidth={1.5} />
							</button>
						</div>
					</div>
				</div>

				<div className="flex gap-4 pt-4">
					<button
						type="button"
						onClick={onCancel}
						className="flex-1 px-6 py-3 border border-neutral-700/80 text-neutral-300/90 rounded-full hover:bg-neutral-850 transition-colors text-sm tracking-wide"
					>
						キャンセル
					</button>
					<button
						type="submit"
						className="flex-1 px-6 py-3 bg-neutral-700 text-neutral-100 rounded-full hover:bg-neutral-750 transition-colors text-sm tracking-wide"
					>
						保存
					</button>
				</div>
			</form>
		</div>
	);
}
