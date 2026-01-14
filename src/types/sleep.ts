export interface SleepRecord {
	id: string;
	date: string; // YYYY-MM-DD
	bedTime: string; // HH:MM
	wakeTime: string; // HH:MM
	hasCaffeine: boolean;
	hasMedication: boolean;
	medicationTime: string;
	hasBath: boolean;
}

// フォーム用。id なしで保存時に付与する
export interface SleepRecordInput {
	date: string;
	bedTime: string;
	wakeTime: string;
	hasCaffeine: boolean;
	hasMedication: boolean;
	medicationTime: string;
	hasBath: boolean;
}

export interface PendingBedTime {
	time: string; // HH:MM
	date: string; // YYYY-MM-DD
	timestamp: string; // ISO string
}

export interface PendingMedication {
	time: string; // HH:MM
	timestamp: string; // ISO string
}
