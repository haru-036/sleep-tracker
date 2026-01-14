import {
	Bath,
	Bed,
	ChartNoAxesGantt,
	Circle,
	Coffee,
	Moon,
	Pill,
	RotateCw,
	Sun,
	X,
} from "lucide-react";
import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import type {
	PendingBedTime,
	PendingMedication,
	SleepRecord,
	SleepRecordInput,
} from "./types/sleep";
import {
	clearPendingBedTime,
	clearPendingMedication,
	loadPendingBedTime,
	loadPendingMedication,
	loadSleepRecords,
	savePendingBedTime,
	savePendingMedication,
	saveSleepRecord,
} from "./utils/sleepStorage";

export default function SleepTracker() {
	const [records, setRecords] = useState<SleepRecord[]>([]);
	const [showForm, setShowForm] = useState(false);
	const [showSleepScreen, setShowSleepScreen] = useState(false);
	const [showMedicationModal, setShowMedicationModal] = useState(false);
	const [tempMedicationTime, setTempMedicationTime] = useState("");
	const [pendingBedTime, setPendingBedTime] = useState<PendingBedTime | null>(
		null,
	);
	const [pendingMedication, setPendingMedication] =
		useState<PendingMedication | null>(null);
	const [currentRecord, setCurrentRecord] = useState<SleepRecordInput>({
		date: new Date().toISOString().split("T")[0],
		bedTime: "",
		wakeTime: "",
		hasCaffeine: false,
		hasMedication: false,
		medicationTime: "",
		hasBath: false,
	});

	// Load records from storage on mount
	useEffect(() => {
		const loaded = loadSleepRecords();
		setRecords(loaded);

		const pendingBed = loadPendingBedTime();
		if (pendingBed) {
			setPendingBedTime(pendingBed);
			setShowSleepScreen(true);
		}

		const pendingMed = loadPendingMedication();
		if (pendingMed) {
			setPendingMedication(pendingMed);
		}
	}, []);

	const handleGoingToBed = async () => {
		const now = new Date();

		// Add 10 minutes
		const futureTime = new Date(now.getTime() + 10 * 60 * 1000);

		// Round up to nearest 5 minutes
		const minutes = futureTime.getMinutes();
		const roundedMinutes = Math.ceil(minutes / 5) * 5;

		if (roundedMinutes >= 60) {
			futureTime.setHours(futureTime.getHours() + 1);
			futureTime.setMinutes(0);
		} else {
			futureTime.setMinutes(roundedMinutes);
		}

		const bedTime = futureTime.toTimeString().slice(0, 5);
		const bedDate = now.toISOString().split("T")[0];

		const bedTimeData = {
			time: bedTime,
			date: bedDate,
			timestamp: now.toISOString(),
		};

		setPendingBedTime(bedTimeData);
		setShowSleepScreen(true);
		savePendingBedTime(bedTimeData);
	};

	const handleTakeMedication = () => {
		const now = new Date();
		const medicationTime = now.toTimeString().slice(0, 5);
		setTempMedicationTime(
			pendingMedication ? pendingMedication.time : medicationTime,
		);
		setShowMedicationModal(true);
	};

	const handleSaveMedication = async () => {
		// If we're in the form, update the current record
		if (showForm) {
			setCurrentRecord({
				...currentRecord,
				medicationTime: tempMedicationTime,
			});
			setShowMedicationModal(false);
			return;
		}

		// Otherwise, save as pending medication (for main screen)
		const medData = {
			time: tempMedicationTime,
			timestamp: new Date().toISOString(),
		};

		setPendingMedication(medData);
		setShowMedicationModal(false);
		savePendingMedication(medData);
	};

	const handleClearMedication = async () => {
		setPendingMedication(null);
		setShowMedicationModal(false);
		clearPendingMedication();
	};

	const handleWakeUp = () => {
		const now = new Date();
		const currentTime = now.toTimeString().slice(0, 5);

		if (pendingBedTime) {
			setCurrentRecord({
				date: pendingBedTime.date,
				bedTime: pendingBedTime.time,
				wakeTime: currentTime,
				hasCaffeine: false,
				hasMedication: !!pendingMedication,
				medicationTime: pendingMedication ? pendingMedication.time : "",
				hasBath: false,
			});
		}

		setShowSleepScreen(false);
		setShowForm(true);
	};

	const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		const newRecord = {
			...currentRecord,
			id: Date.now().toString(),
		};

		// Update records in state
		setRecords(
			[newRecord, ...records.filter((r) => r.date !== newRecord.date)].sort(
				(a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
			),
		);

		// Clear pending data
		setPendingBedTime(null);
		setPendingMedication(null);
		saveSleepRecord(newRecord);
		clearPendingBedTime();
		clearPendingMedication();

		setShowForm(false);
		setShowSleepScreen(false);
		setCurrentRecord({
			date: new Date().toISOString().split("T")[0],
			bedTime: "",
			wakeTime: "",
			hasCaffeine: false,
			hasMedication: false,
			medicationTime: "",
			hasBath: false,
		});
	};

	const calculateSleepDuration = (
		bedTime: string,
		wakeTime: string,
	): string | null => {
		if (!bedTime || !wakeTime) return null;

		const [bedHour, bedMin] = bedTime.split(":").map(Number);
		const [wakeHour, wakeMin] = wakeTime.split(":").map(Number);

		const bedMinutes = bedHour * 60 + bedMin;
		let wakeMinutes = wakeHour * 60 + wakeMin;

		// If wake time is earlier, assume it's next day
		if (wakeMinutes < bedMinutes) {
			wakeMinutes += 24 * 60;
		}

		const duration = wakeMinutes - bedMinutes;
		const hours = Math.floor(duration / 60);
		const minutes = duration % 60;

		return `${hours}h ${minutes}m`;
	};

	const calculateMinutesUntilBed = () => {
		if (!pendingBedTime) return 0;

		const now = new Date();
		const [hours, minutes] = pendingBedTime.time.split(":").map(Number);
		const bedDateTime = new Date();
		bedDateTime.setHours(hours, minutes, 0, 0);

		const diffMs = bedDateTime.getTime() - now.getTime();
		const diffMinutes = Math.round(diffMs / (1000 * 60));

		return diffMinutes > 0 ? diffMinutes : 0;
	};

	const formatDate = (dateStr: string): string => {
		const date = new Date(dateStr);
		const month = date.getMonth() + 1;
		const day = date.getDate();
		return `${month}/${day}`;
	};

	const formatDateFull = (dateStr: string): string => {
		const date = new Date(dateStr);
		const month = date.getMonth() + 1;
		const day = date.getDate();
		const weekdays = ["日", "月", "火", "水", "木", "金", "土"];
		const weekday = weekdays[date.getDay()];
		return `${month}月${day}日 (${weekday})`;
	};

	return (
		<div className="min-h-screen bg-neutral-950 text-neutral-100">
			{/* Sleep Waiting Screen */}
			{showSleepScreen && !showForm && (
				<div className="fixed inset-0 bg-neutral-950 z-50 flex flex-col">
					<button
						type="button"
						onClick={() => setShowSleepScreen(false)}
						className="absolute top-8 right-8 text-neutral-400 hover:text-neutral-200 transition-colors"
					>
						<X className="w-6 h-6" strokeWidth={1.5} />
					</button>

					<div className="flex-1 flex flex-col items-center justify-center p-8 space-y-10">
						<div className="text-center space-y-3">
							<h2 className="text-2xl font-light text-neutral-300 tracking-wider">
								おやすみなさい
							</h2>
						</div>

						<div className="w-full max-w-sm">
							<div className="bg-neutral-900/70 backdrop-blur-sm rounded-3xl p-12 text-center space-y-6 border border-neutral-800/50">
								<div className="w-24 h-24 mx-auto bg-neutral-800 rounded-full flex items-center justify-center">
									<Bed
										className="w-12 h-12 text-neutral-400"
										strokeWidth={1.5}
									/>
								</div>

								<div className="space-y-1">
									<p className="text-neutral-400 text-xs tracking-wide">
										就寝時間
									</p>
									<input
										type="time"
										className="text-5xl font-light text-neutral-100 tracking-tight text-center h-18"
										value={pendingBedTime?.time}
										onChange={(event) =>
											setPendingBedTime((prev) => ({
												// biome-ignore lint/style/noNonNullAssertion: OK here
												...prev!,
												time: event.target.value,
											}))
										}
									/>
									<p className="text-neutral-500 text-xs">
										({calculateMinutesUntilBed()}分後)
									</p>
									<button
										type="button"
										className="mt-1 p-2.5 inline-flex items-center justify-center text-neutral-400 hover:text-neutral-200 transition-colors"
										onClick={handleGoingToBed}
									>
										<RotateCw size={16} />
									</button>
								</div>
							</div>
						</div>

						<button
							type="button"
							onClick={handleWakeUp}
							className="w-full max-w-sm bg-neutral-800 border border-neutral-700 text-neutral-200 rounded-full py-4 hover:bg-neutral-750 transition-colors text-sm tracking-wide"
						>
							起床記録を入力
						</button>
					</div>
				</div>
			)}

			{/* Main Content */}
			<div className="max-w-2xl mx-auto px-6 py-12">
				{/* Header */}
				<div className="mb-16">
					{!showForm ? (
						<>
							<h1 className="text-xl font-light tracking-wide mb-2 text-neutral-100">
								zzz...
							</h1>
							<p className="text-neutral-500 text-sm tracking-wide">
								{formatDateFull(currentRecord.date)}
							</p>
						</>
					) : (
						<>
							<h1 className="text-xl font-light tracking-wide mb-2 text-neutral-100">
								睡眠記録
							</h1>
							<p className="text-neutral-400 text-sm tracking-wide">
								{formatDateFull(currentRecord.date)}
							</p>
						</>
					)}
				</div>

				{/* Medication Modal */}
				{showMedicationModal && (
					// biome-ignore lint/a11y/useSemanticElements: Modal container
					<div
						className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6"
						role="button"
						tabIndex={0}
						onClick={() => setShowMedicationModal(false)}
						onKeyDown={(e) => {
							if (e.key === "Enter" || e.key === " ") {
								e.preventDefault();
								setShowMedicationModal(false);
							}
						}}
					>
						<div
							className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 w-full max-w-sm relative"
							role="dialog"
							aria-modal="true"
							onClick={(e) => e.stopPropagation()}
							onKeyDown={(e) => e.stopPropagation()}
						>
							<button
								type="button"
								onClick={() => setShowMedicationModal(false)}
								className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-200 transition-colors"
							>
								<X className="w-5 h-5" strokeWidth={1.5} />
							</button>

							<h3 className="text-lg font-light text-neutral-200 mb-6 text-center">
								眠剤
							</h3>

							<div className="mb-6">
								<label
									htmlFor="medication-time-input"
									className="text-xs text-neutral-400 mb-2 block tracking-wide"
								>
									服用時間
								</label>
								<input
									type="time"
									id="medication-time-input"
									value={tempMedicationTime}
									onChange={(e) => setTempMedicationTime(e.target.value)}
									className="w-full max-w-full px-4 py-3 bg-neutral-800 border border-neutral-700 text-neutral-100 rounded-2xl focus:border-neutral-600 focus:outline-none text-xl font-light text-center appearance-none [-webkit-appearance:none]"
									style={{ boxSizing: "border-box" }}
								/>
							</div>

							<div className="flex gap-3">
								{pendingMedication && (
									<button
										type="button"
										onClick={handleClearMedication}
										className="flex-1 px-6 py-3 border border-neutral-700 text-neutral-400 rounded-full hover:bg-neutral-850 transition-colors text-sm tracking-wide"
									>
										削除
									</button>
								)}
								<button
									type="button"
									onClick={handleSaveMedication}
									className="flex-1 px-6 py-3 bg-neutral-800 text-neutral-100 rounded-full hover:bg-neutral-750 transition-colors text-sm tracking-wide"
								>
									保存
								</button>
							</div>
						</div>
					</div>
				)}

				{/* Going to Bed Button */}
				{!showForm && !showSleepScreen && (
					<div className="space-y-4 mb-16">
						{/* Medication Button */}
						<div className="flex justify-end">
							<button
								type="button"
								onClick={handleTakeMedication}
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

						{/* Going to Bed Button */}
						<button
							type="button"
							onClick={handleGoingToBed}
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
				)}

				{/* Form */}
				{showForm && (
					<div className="mb-16">
						<form onSubmit={handleSubmit} className="space-y-8">
							{/* Time Inputs */}
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
										onChange={(e) =>
											setCurrentRecord({
												...currentRecord,
												bedTime: e.target.value,
											})
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
										onChange={(e) =>
											setCurrentRecord({
												...currentRecord,
												wakeTime: e.target.value,
											})
										}
										className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 text-neutral-100 rounded-2xl focus:border-neutral-600 focus:outline-none text-lg font-light appearance-none [-webkit-appearance:none]"
										style={{ boxSizing: "border-box" }}
										required
									/>
								</div>
							</div>

							{/* Toggle Options */}
							<div className="space-y-6">
								{/* Coffee */}
								<div className="flex items-center justify-between">
									<label
										htmlFor="coffee-input"
										className="flex items-center gap-2 text-sm text-neutral-300 tracking-wide"
									>
										<Coffee className="w-4 h-4" strokeWidth={1.5} />
										コーヒー
									</label>
									<div className="flex gap-2">
										<button
											type="button"
											onClick={() =>
												setCurrentRecord({
													...currentRecord,
													hasCaffeine: false,
												})
											}
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
											onClick={() =>
												setCurrentRecord({
													...currentRecord,
													hasCaffeine: true,
												})
											}
											className={`w-10 h-10 rounded-full transition-colors flex items-center justify-center ${
												currentRecord.hasCaffeine
													? "bg-neutral-700 border border-neutral-600 text-neutral-100"
													: "bg-neutral-850 border border-neutral-800 text-neutral-500 hover:border-neutral-700"
											}`}
										>
											<Circle className="size-4" strokeWidth={1.5} />
										</button>
									</div>
								</div>

								{/* Bath */}
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
											onClick={() =>
												setCurrentRecord({ ...currentRecord, hasBath: false })
											}
											className={`w-10 h-10 rounded-full transition-colors flex items-center justify-center ${
												!currentRecord.hasBath
													? "bg-neutral-700 border border-neutral-600 text-neutral-100"
													: "bg-neutral-850 border border-neutral-800 text-neutral-500 hover:border-neutral-700"
											}`}
										>
											<X className="size-4" strokeWidth={1.5} />
										</button>
										<button
											type="button"
											onClick={() =>
												setCurrentRecord({ ...currentRecord, hasBath: true })
											}
											className={`w-10 h-10 rounded-full transition-colors flex items-center justify-center ${
												currentRecord.hasBath
													? "bg-neutral-700 border border-neutral-600 text-neutral-100"
													: "bg-neutral-850 border border-neutral-800 text-neutral-500 hover:border-neutral-700"
											}`}
										>
											<Circle className="size-4" strokeWidth={1.5} />
										</button>
									</div>
								</div>

								{/* Medication */}
								<div className="flex items-center justify-between">
									<div className="flex items-center gap-3">
										<div className="flex items-center gap-2">
											<Pill
												className="w-4 h-4 text-neutral-300"
												strokeWidth={1.5}
											/>
											<span className="text-sm text-neutral-300 tracking-wide">
												眠剤
											</span>
										</div>
										<button
											type="button"
											onClick={() => {
												if (currentRecord.hasMedication) {
													setTempMedicationTime(
														currentRecord.medicationTime ||
															new Date().toTimeString().slice(0, 5),
													);
													setShowMedicationModal(true);
												}
											}}
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
											onClick={() =>
												setCurrentRecord({
													...currentRecord,
													hasMedication: false,
												})
											}
											className={`w-10 h-10 rounded-full transition-colors flex items-center justify-center ${
												!currentRecord.hasMedication
													? "bg-neutral-700 border border-neutral-600 text-neutral-100"
													: "bg-neutral-850 border border-neutral-800 text-neutral-500 hover:border-neutral-700"
											}`}
										>
											<X className="size-4" strokeWidth={1.5} />
										</button>
										<button
											type="button"
											onClick={() =>
												setCurrentRecord({
													...currentRecord,
													hasMedication: true,
												})
											}
											className={`w-10 h-10 rounded-full transition-colors flex items-center justify-center ${
												currentRecord.hasMedication
													? "bg-neutral-700 border border-neutral-600 text-neutral-100"
													: "bg-neutral-850 border border-neutral-800 text-neutral-500 hover:border-neutral-700"
											}`}
										>
											<Circle className="size-4" strokeWidth={1.5} />
										</button>
									</div>
								</div>
							</div>

							{/* Buttons */}
							<div className="flex gap-4 pt-4">
								<button
									type="button"
									onClick={() => setShowForm(false)}
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
				)}

				{/* Records List */}
				{!showForm && !showSleepScreen && (
					<div>
						{records.length === 0 ? (
							<div className="text-center py-16 text-neutral-600">
								<div className="w-16 h-16 mx-auto mb-4 bg-neutral-900 border border-neutral-800 rounded-full flex items-center justify-center">
									<ChartNoAxesGantt
										className="w-8 h-8 text-neutral-700"
										strokeWidth={1.5}
									/>
								</div>
								<p className="text-sm tracking-wide">記録はまだありません</p>
							</div>
						) : (
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
												{calculateSleepDuration(
													record.bedTime,
													record.wakeTime,
												)}
											</span>
										</div>

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

										{(record.hasCaffeine ||
											record.hasBath ||
											record.hasMedication) && (
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
															<span className="ml-1">
																{record.medicationTime}
															</span>
														)}
													</span>
												)}
											</div>
										)}
									</div>
								))}
							</div>
						)}
					</div>
				)}
			</div>
		</div>
	);
}
