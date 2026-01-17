import { Bath, Circle, Coffee, Moon, Pill, Sun, X } from "lucide-react";
import type { FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
						<Label htmlFor="bed-time-input">
							<Moon className="w-3.5 h-3.5" strokeWidth={1.5} />
							就寝
						</Label>
						<Input
							id="bed-time-input"
							type="time"
							value={currentRecord.bedTime}
							onChange={(event) =>
								updateRecord({ bedTime: event.target.value })
							}
							required
						/>
					</div>

					<div className="space-y-3">
						<Label htmlFor="wake-time-input">
							<Sun className="w-3.5 h-3.5" strokeWidth={1.5} />
							起床
						</Label>
						<Input
							id="wake-time-input"
							type="time"
							value={currentRecord.wakeTime}
							onChange={(event) =>
								updateRecord({ wakeTime: event.target.value })
							}
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
					<Button
						type="button"
						variant="outline"
						className="flex-1"
						onClick={onCancel}
					>
						キャンセル
					</Button>
					<Button type="submit" className="flex-1">
						保存
					</Button>
				</div>
			</form>
		</div>
	);
}
