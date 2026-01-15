import { Plus } from "lucide-react";
import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import { MedicationModal } from "./components/MedicationModal";
import { PreSleepActions } from "./components/PreSleepActions";
import { RecordsList } from "./components/RecordsList";
import { SleepForm } from "./components/SleepForm";
import { SleepWaitingScreen } from "./components/SleepWaitingScreen";
import type { ModalType, ScreenType } from "./types/screen";
import type {
	PendingBedTime,
	PendingMedication,
	SleepRecord,
	SleepRecordInput,
} from "./types/sleep";
import { deriveScreen } from "./utils/screenResolver";
import { getLocalDateString } from "./utils/timeUtils";
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
	// データ（永続化対象）
	const [records, setRecords] = useState<SleepRecord[]>([]);
	const [pendingBedTime, setPendingBedTime] = useState<PendingBedTime | null>(
		null,
	);
	const [pendingMedication, setPendingMedication] =
		useState<PendingMedication | null>(null);
	const [currentRecord, setCurrentRecord] = useState<SleepRecordInput>({
		bedDate: "",
		wakeDate: getLocalDateString(),
		bedTime: "",
		wakeTime: "",
		hasCaffeine: false,
		hasMedication: false,
		medicationTime: "",
		hasBath: false,
	});

	// UI状態
	const [manualScreen, setManualScreen] = useState<ScreenType | null>(null);
	const [activeModal, setActiveModal] = useState<ModalType>(null);
	const [tempMedicationTime, setTempMedicationTime] = useState("");

	// 画面決定（派生）
	const autoScreen = deriveScreen(pendingBedTime);
	const screen = manualScreen ?? autoScreen;

	// Load records from storage on mount
	useEffect(() => {
		setRecords(loadSleepRecords());
		setPendingBedTime(loadPendingBedTime());
		setPendingMedication(loadPendingMedication());
	}, []);

	// 画面が自動でformに遷移した場合、currentRecordを初期化
	useEffect(() => {
		if (screen === "form" && pendingBedTime && !manualScreen) {
			const now = new Date();
			setCurrentRecord({
				bedDate: pendingBedTime.date,
				wakeDate: getLocalDateString(now),
				bedTime: pendingBedTime.time,
				wakeTime: now.toTimeString().slice(0, 5),
				hasCaffeine: false,
				hasMedication: !!pendingMedication,
				medicationTime: pendingMedication?.time ?? "",
				hasBath: false,
			});
		}
	}, [screen, pendingBedTime, pendingMedication, manualScreen]);

	const handlePendingBedTimeChange = (value: string) => {
		setPendingBedTime((prev) => (prev ? { ...prev, time: value } : prev));
	};

	const handleRecordChange = (nextRecord: SleepRecordInput) => {
		// bedTimeが変更された場合、bedDateを自動計算（24時間以上寝ることはない前提）
		if (nextRecord.bedTime && nextRecord.wakeTime && nextRecord.wakeDate) {
			const bedDate =
				nextRecord.bedTime > nextRecord.wakeTime
					? getPreviousDate(nextRecord.wakeDate)
					: nextRecord.wakeDate;
			nextRecord = { ...nextRecord, bedDate };
		}
		setCurrentRecord(nextRecord);
	};

	const getPreviousDate = (dateStr: string): string => {
		const date = new Date(dateStr);
		date.setDate(date.getDate() - 1);
		return getLocalDateString(date);
	};

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
		const bedDate = getLocalDateString(now);

		const bedTimeData = {
			time: bedTime,
			date: bedDate,
			timestamp: now.toISOString(),
		};

		setPendingBedTime(bedTimeData);
		setManualScreen(null); // 自動決定に戻す
		savePendingBedTime(bedTimeData);
	};

	const handleTakeMedication = () => {
		const now = new Date();
		const medicationTime = now.toTimeString().slice(0, 5);
		setTempMedicationTime(
			pendingMedication ? pendingMedication.time : medicationTime,
		);
		setActiveModal("medication");
	};

	const handleOpenFormMedicationModal = () => {
		setTempMedicationTime(
			currentRecord.medicationTime || new Date().toTimeString().slice(0, 5),
		);
		setActiveModal("medication");
	};

	const handleSaveMedication = async () => {
		// If we're in the form, update the current record
		if (screen === "form") {
			setCurrentRecord({
				...currentRecord,
				medicationTime: tempMedicationTime,
			});
			setActiveModal(null);
			return;
		}

		// Otherwise, save as pending medication (for main screen)
		const medData = {
			time: tempMedicationTime,
			timestamp: new Date().toISOString(),
		};

		setPendingMedication(medData);
		setActiveModal(null);
		savePendingMedication(medData);
	};

	const handleClearMedication = async () => {
		setPendingMedication(null);
		setActiveModal(null);
		clearPendingMedication();
	};

	const handleWakeUp = () => {
		const now = new Date();
		const currentTime = now.toTimeString().slice(0, 5);
		const wakeDate = getLocalDateString(now);

		if (pendingBedTime) {
			setCurrentRecord({
				bedDate: pendingBedTime.date,
				wakeDate: wakeDate,
				bedTime: pendingBedTime.time,
				wakeTime: currentTime,
				hasCaffeine: false,
				hasMedication: !!pendingMedication,
				medicationTime: pendingMedication ? pendingMedication.time : "",
				hasBath: false,
			});
		} else {
			// 手動で+ボタンから開いた場合
			setCurrentRecord({
				bedDate: "",
				wakeDate: wakeDate,
				bedTime: "",
				wakeTime: currentTime,
				hasCaffeine: false,
				hasMedication: false,
				medicationTime: "",
				hasBath: false,
			});
		}

		setManualScreen("form");
	};

	const handleCloseWaitingScreen = () => {
		setManualScreen("home");
	};

	const handleCancelForm = () => {
		setManualScreen("home");
	};

	const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		const newRecord = {
			...currentRecord,
			id: Date.now().toString(),
		};

		// Update records in state
		setRecords(
			[
				newRecord,
				...records.filter((r) => r.wakeDate !== newRecord.wakeDate),
			].sort(
				(a, b) =>
					new Date(b.wakeDate).getTime() - new Date(a.wakeDate).getTime(),
			),
		);

		// Clear pending data
		setPendingBedTime(null);
		setPendingMedication(null);
		saveSleepRecord(newRecord);
		clearPendingBedTime();
		clearPendingMedication();

		setManualScreen(null); // 自動決定に戻す
		setCurrentRecord({
			bedDate: "",
			wakeDate: getLocalDateString(),
			bedTime: "",
			wakeTime: "",
			hasCaffeine: false,
			hasMedication: false,
			medicationTime: "",
			hasBath: false,
		});
	};

	const calculateSleepDuration = (
		bedDate: string,
		bedTime: string,
		wakeDate: string,
		wakeTime: string,
	): string | null => {
		if (!bedDate || !bedTime || !wakeDate || !wakeTime) return null;

		const bedDateTime = new Date(`${bedDate}T${bedTime}:00`);
		const wakeDateTime = new Date(`${wakeDate}T${wakeTime}:00`);

		const durationMs = wakeDateTime.getTime() - bedDateTime.getTime();
		const durationMinutes = Math.floor(durationMs / (1000 * 60));

		const hours = Math.floor(durationMinutes / 60);
		const minutes = durationMinutes % 60;

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
		const jstDate = new Date(
			date.toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" }),
		);
		const month = jstDate.getMonth() + 1;
		const day = jstDate.getDate();
		return `${month}/${day}`;
	};

	const formatDateFull = (dateStr: string): string => {
		const date = new Date(dateStr);
		const jstDate = new Date(
			date.toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" }),
		);
		const month = jstDate.getMonth() + 1;
		const day = jstDate.getDate();
		const weekdays = ["日", "月", "火", "水", "木", "金", "土"];
		const weekday = weekdays[jstDate.getDay()];
		return `${month}月${day}日 (${weekday})`;
	};

	return (
		<div className="min-h-svh bg-neutral-950 text-neutral-100 relative">
			{screen === "sleeping" && pendingBedTime && (
				<SleepWaitingScreen
					pendingBedTime={pendingBedTime}
					minutesUntilBed={calculateMinutesUntilBed()}
					onClose={handleCloseWaitingScreen}
					onRefresh={handleGoingToBed}
					onTimeChange={handlePendingBedTimeChange}
					onWakeUp={handleWakeUp}
				/>
			)}

			{/* Main Content */}
			<div className="max-w-2xl mx-auto px-6 py-12">
				{/* Header */}
				<div className="mb-16">
					{screen !== "form" ? (
						<>
							<h1 className="text-xl font-light tracking-wide mb-2 text-neutral-100">
								zzz...
							</h1>
							<p className="text-neutral-500 text-sm tracking-wide">
								{formatDateFull(currentRecord.wakeDate)}
							</p>
						</>
					) : (
						<>
							<h1 className="text-xl font-light tracking-wide mb-2 text-neutral-100">
								睡眠記録
							</h1>
							<input
								type="date"
								value={currentRecord.wakeDate}
								onChange={(e) =>
									handleRecordChange({
										...currentRecord,
										wakeDate: e.target.value,
									})
								}
								className="text-neutral-400 text-sm tracking-wide bg-transparent border-none outline-none cursor-pointer"
							/>
						</>
					)}
				</div>

				{/* Medication Modal */}
				<MedicationModal
					isOpen={activeModal === "medication"}
					tempMedicationTime={tempMedicationTime}
					onTimeChange={setTempMedicationTime}
					onClose={() => setActiveModal(null)}
					onSave={handleSaveMedication}
					onClear={
						screen !== "form" && pendingMedication
							? handleClearMedication
							: undefined
					}
					showClearButton={screen !== "form" && !!pendingMedication}
				/>

				{/* Home Screen */}
				{screen === "home" && (
					<>
						<PreSleepActions
							pendingMedication={pendingMedication}
							onMedicationClick={handleTakeMedication}
							onGoingToBed={handleGoingToBed}
						/>

						<button
							type="button"
							className="fixed bottom-5 right-5 size-14 rounded-full bg-neutral-800 border border-neutral-700 text-neutral-400 hover:border-neutral-700 flex items-center justify-center"
							onClick={handleWakeUp}
						>
							<Plus className="w-6 h-6 text-neutral-400" strokeWidth={1.5} />
						</button>

						<RecordsList
							records={records}
							formatDate={formatDate}
							calculateSleepDuration={calculateSleepDuration}
						/>
					</>
				)}

				{/* Form Screen */}
				{screen === "form" && (
					<SleepForm
						currentRecord={currentRecord}
						onChange={handleRecordChange}
						onSubmit={handleSubmit}
						onCancel={handleCancelForm}
						onMedicationTimeClick={handleOpenFormMedicationModal}
					/>
				)}
			</div>
		</div>
	);
}
