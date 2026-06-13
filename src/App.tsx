import { Coffee, Pill, Plus } from "lucide-react";
import type { FormEvent } from "react";
import { lazy, Suspense, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { PreSleepActions } from "./components/PreSleepActions";
import { RecordsList } from "./components/RecordsList";
import { SleepForm } from "./components/SleepForm";
import { SleepWaitingScreen } from "./components/SleepWaitingScreen";
import { TimeInputModal } from "./components/TimeInputModal";
import type { ModalType, ScreenType } from "./types/screen";
import type {
  PendingBedTime,
  PendingCaffeine,
  PendingMedication,
  SleepRecord,
  SleepRecordInput,
} from "./types/sleep";
import { formatDate, formatDateFull } from "./utils/dateFormat";
import { deriveScreen } from "./utils/screenResolver";
const SleepChart = lazy(() =>
  import("./components/SleepChart").then((m) => ({ default: m.SleepChart })),
);

import {
  clearPendingBedTime,
  clearPendingCaffeine,
  clearPendingMedication,
  exportSleepRecords,
  loadPendingBedTime,
  loadPendingCaffeine,
  loadPendingMedication,
  loadSleepRecords,
  removeSleepRecord,
  savePendingBedTime,
  savePendingCaffeine,
  savePendingMedication,
  saveSleepRecord,
} from "./utils/sleepStorage";
import { getLocalDateString, getPreviousDate } from "./utils/timeUtils";

function createEmptyRecord(): SleepRecordInput {
  return {
    bedDate: "",
    wakeDate: getLocalDateString(),
    bedTime: "",
    wakeTime: "",
    hasCaffeine: false,
    caffeineTime: "",
    hasMedication: false,
    medicationTime: "",
    hasBath: false,
  };
}

export default function SleepTracker() {
  // データ（永続化対象）
  const [records, setRecords] = useState<SleepRecord[]>([]);
  const [pendingBedTime, setPendingBedTime] = useState<PendingBedTime | null>(
    null,
  );
  const [pendingMedication, setPendingMedication] =
    useState<PendingMedication | null>(null);
  const [pendingCaffeine, setPendingCaffeine] =
    useState<PendingCaffeine | null>(null);
  const [currentRecord, setCurrentRecord] =
    useState<SleepRecordInput>(createEmptyRecord);

  // UI状態
  const [manualScreen, setManualScreen] = useState<ScreenType | null>(null);
  // 編集中の記録（新規記録と区別するための識別子。null なら新規）
  const [editingTarget, setEditingTarget] = useState<{
    id: string;
  } | null>(null);
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [tempMedicationTime, setTempMedicationTime] = useState("");
  const [tempCaffeineTime, setTempCaffeineTime] = useState("");

  // 画面決定（派生）
  const autoScreen = deriveScreen(pendingBedTime);
  const screen = manualScreen ?? autoScreen;

  // Load records from storage on mount
  useEffect(() => {
    setRecords(loadSleepRecords());
    setPendingBedTime(loadPendingBedTime());
    setPendingMedication(loadPendingMedication());
    setPendingCaffeine(loadPendingCaffeine());
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
        hasCaffeine: !!pendingCaffeine,
        caffeineTime: pendingCaffeine?.time ?? "",
        hasMedication: !!pendingMedication,
        medicationTime: pendingMedication?.time ?? "",
        hasBath: false,
      });
    }
  }, [
    screen,
    pendingBedTime,
    pendingMedication,
    pendingCaffeine,
    manualScreen,
  ]);

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
    setManualScreen("sleeping"); // 待機画面へ遷移
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

  const handleTakeCoffee = () => {
    const now = new Date();
    const caffeineTime = now.toTimeString().slice(0, 5);
    setTempCaffeineTime(pendingCaffeine ? pendingCaffeine.time : caffeineTime);
    setActiveModal("caffeine");
  };

  const handleOpenFormCaffeineModal = () => {
    setTempCaffeineTime(
      currentRecord.caffeineTime || new Date().toTimeString().slice(0, 5),
    );
    setActiveModal("caffeine");
  };

  const handleSaveCaffeine = async () => {
    // If we're in the form, update the current record
    if (screen === "form") {
      setCurrentRecord({
        ...currentRecord,
        caffeineTime: tempCaffeineTime,
      });
      setActiveModal(null);
      return;
    }

    // Otherwise, save as pending caffeine (for main screen)
    const caffeineData = {
      time: tempCaffeineTime,
      timestamp: new Date().toISOString(),
    };

    setPendingCaffeine(caffeineData);
    setActiveModal(null);
    savePendingCaffeine(caffeineData);
  };

  const handleClearCaffeine = async () => {
    setPendingCaffeine(null);
    setActiveModal(null);
    clearPendingCaffeine();
  };

  const handleEditRecord = (record: SleepRecord) => {
    setEditingTarget({ id: record.id });
    setCurrentRecord({
      bedDate: record.bedDate,
      wakeDate: record.wakeDate,
      bedTime: record.bedTime,
      wakeTime: record.wakeTime,
      hasCaffeine: record.hasCaffeine,
      caffeineTime: record.caffeineTime,
      hasMedication: record.hasMedication,
      medicationTime: record.medicationTime,
      hasBath: record.hasBath,
    });
    setManualScreen("form");
  };

  const handleWakeUp = () => {
    setEditingTarget(null);
    const now = new Date();
    const currentTime = now.toTimeString().slice(0, 5);
    const wakeDate = getLocalDateString(now);

    if (pendingBedTime) {
      setCurrentRecord({
        bedDate: pendingBedTime.date,
        wakeDate: wakeDate,
        bedTime: pendingBedTime.time,
        wakeTime: currentTime,
        hasCaffeine: !!pendingCaffeine,
        caffeineTime: pendingCaffeine ? pendingCaffeine.time : "",
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
        caffeineTime: "",
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
    setEditingTarget(null);
    setManualScreen("home");
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // 編集: 既存記録の更新。pending には触れず
    if (editingTarget) {
      const updatedRecord: SleepRecord = {
        ...currentRecord,
        id: editingTarget.id,
      };

      setRecords(
        [
          updatedRecord,
          ...records.filter((r) => r.id !== editingTarget.id),
        ].sort(
          (a, b) =>
            new Date(b.wakeDate).getTime() - new Date(a.wakeDate).getTime(),
        ),
      );

      removeSleepRecord(editingTarget.id);
      saveSleepRecord(updatedRecord);

      setEditingTarget(null);
      setManualScreen("home");
      setCurrentRecord(createEmptyRecord());
      return;
    }

    const newRecord = {
      ...currentRecord,
      id: Date.now().toString(),
    };

    setRecords(
      [newRecord, ...records].sort(
        (a, b) =>
          new Date(b.wakeDate).getTime() - new Date(a.wakeDate).getTime(),
      ),
    );

    // Clear pending data
    setPendingBedTime(null);
    setPendingMedication(null);
    setPendingCaffeine(null);
    saveSleepRecord(newRecord);
    clearPendingBedTime();
    clearPendingMedication();
    clearPendingCaffeine();

    setManualScreen(null); // 自動決定に戻す
    setCurrentRecord(createEmptyRecord());
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

  return (
    <div className="min-h-svh max-w-2xl mx-auto bg-background text-foreground relative">
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
      <div className="px-3 py-12">
        {/* Header */}
        <div className="mb-10 px-3">
          {screen === "home" ? (
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-xl font-light tracking-wide mb-2 text-neutral-100">
                  zzz...
                </h1>
                <p className="text-neutral-500 text-sm tracking-wide">
                  {formatDateFull(getLocalDateString())}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleTakeCoffee}
                  className={
                    pendingCaffeine
                      ? "bg-neutral-800 border border-neutral-700 px-3 w-auto"
                      : "bg-neutral-900 border border-neutral-700 hover:bg-neutral-850"
                  }
                >
                  <Coffee
                    className={`w-4 h-4 ${pendingCaffeine ? "text-neutral-200" : "text-neutral-400"
                      }`}
                    strokeWidth={1.5}
                  />
                  {pendingCaffeine && (
                    <span className="text-sm text-neutral-300 font-light tracking-wide">
                      {pendingCaffeine.time}
                    </span>
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleTakeMedication}
                  className={
                    pendingMedication
                      ? "bg-neutral-800 border border-neutral-700 px-3 w-auto"
                      : "bg-neutral-900 border border-neutral-700 hover:bg-neutral-850"
                  }
                >
                  <Pill
                    className={`w-4 h-4 ${pendingMedication
                        ? "text-neutral-200"
                        : "text-neutral-400"
                      }`}
                    strokeWidth={1.5}
                  />
                  {pendingMedication && (
                    <span className="text-sm text-neutral-300 font-light tracking-wide">
                      {pendingMedication.time}
                    </span>
                  )}
                </Button>
              </div>
            </div>
          ) : screen === "form" ? (
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
                className="text-neutral-400 p-0 appearance-none text-sm tracking-wide bg-transparent border-none outline-none cursor-pointer"
              />
            </>
          ) : (
            <>
              <h1 className="text-xl font-light tracking-wide mb-2 text-neutral-100">
                zzz...
              </h1>
              <p className="text-neutral-500 text-sm tracking-wide">
                {formatDateFull(getLocalDateString())}
              </p>
            </>
          )}
        </div>

        {/* Time Input Modals */}
        <TimeInputModal
          isOpen={activeModal === "medication"}
          title="眠剤"
          label="服用時間"
          time={tempMedicationTime}
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
        <TimeInputModal
          isOpen={activeModal === "caffeine"}
          title="コーヒー"
          label="摂取時間"
          time={tempCaffeineTime}
          onTimeChange={setTempCaffeineTime}
          onClose={() => setActiveModal(null)}
          onSave={handleSaveCaffeine}
          onClear={
            screen !== "form" && pendingCaffeine
              ? handleClearCaffeine
              : undefined
          }
          showClearButton={screen !== "form" && !!pendingCaffeine}
        />

        {/* Home Screen */}
        {screen === "home" && (
          <>
            <PreSleepActions onGoingToBed={handleGoingToBed} />

            <Button
              variant="secondary"
              size="icon-lg"
              className="fixed bottom-10 right-4 border z-50 border-neutral-700 text-neutral-400"
              onClick={handleWakeUp}
            >
              <Plus className="size-6" strokeWidth={1.5} />
            </Button>

            <Suspense fallback={null}>
              <SleepChart records={records} />
            </Suspense>

            <RecordsList
              records={records}
              formatDate={formatDate}
              onEditRecord={handleEditRecord}
              onExport={exportSleepRecords}
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
            onCaffeineTimeClick={handleOpenFormCaffeineModal}
          />
        )}
      </div>
    </div>
  );
}
