import { Plus } from "lucide-react";
import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import { MedicationModal } from "./components/MedicationModal";
import { PreSleepActions } from "./components/PreSleepActions";
import { RecordsList } from "./components/RecordsList";
import { SleepForm } from "./components/SleepForm";
import { SleepWaitingScreen } from "./components/SleepWaitingScreen";
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

	const handlePendingBedTimeChange = (value: string) => {
		setPendingBedTime((prev) => (prev ? { ...prev, time: value } : prev));
	};

	const handleRecordChange = (nextRecord: SleepRecordInput) => {
		setCurrentRecord(nextRecord);
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

	const handleOpenFormMedicationModal = () => {
		setTempMedicationTime(
			currentRecord.medicationTime || new Date().toTimeString().slice(0, 5),
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
		<div className="min-h-screen bg-neutral-950 text-neutral-100 relative">
			{showSleepScreen && !showForm && pendingBedTime && (
				<SleepWaitingScreen
					pendingBedTime={pendingBedTime}
					minutesUntilBed={calculateMinutesUntilBed()}
					onClose={() => setShowSleepScreen(false)}
					onRefresh={handleGoingToBed}
					onTimeChange={handlePendingBedTimeChange}
					onWakeUp={handleWakeUp}
				/>
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
				<MedicationModal
					isOpen={showMedicationModal}
					tempMedicationTime={tempMedicationTime}
					onTimeChange={setTempMedicationTime}
					onClose={() => setShowMedicationModal(false)}
					onSave={handleSaveMedication}
					onClear={
						!showForm && pendingMedication ? handleClearMedication : undefined
					}
					showClearButton={!showForm && !!pendingMedication}
				/>

				{/* Going to Bed Button */}
				{!showForm && !showSleepScreen && (
					<PreSleepActions
						pendingMedication={pendingMedication}
						onMedicationClick={handleTakeMedication}
						onGoingToBed={handleGoingToBed}
					/>
				)}

				{!showForm && !showSleepScreen && (
					<button
						type="button"
						className="fixed bottom-5 right-5 size-14 rounded-full bg-neutral-800 border border-neutral-700 text-neutral-400 hover:border-neutral-700 flex items-center justify-center"
						onClick={handleWakeUp}
					>
						<Plus className="w-6 h-6 text-neutral-400" strokeWidth={1.5} />
					</button>
				)}

				{/* Form */}
				{showForm && (
					<SleepForm
						currentRecord={currentRecord}
						onChange={handleRecordChange}
						onSubmit={handleSubmit}
						onCancel={() => setShowForm(false)}
						onMedicationTimeClick={handleOpenFormMedicationModal}
					/>
				)}

				{/* Records List */}
				{!showForm && !showSleepScreen && (
					<RecordsList
						records={records}
						formatDate={formatDate}
						calculateSleepDuration={calculateSleepDuration}
					/>
				)}
			</div>
		</div>
	);
}
