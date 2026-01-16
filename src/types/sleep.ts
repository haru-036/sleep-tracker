export interface SleepRecord {
	id: string;
	bedDate: string; // 就寝日 YYYY-MM-DD
	wakeDate: string; // 起床日 YYYY-MM-DD
	bedTime: string; // HH:MM
	wakeTime: string; // HH:MM
	hasCaffeine: boolean;
	caffeineTime: string;
	hasMedication: boolean;
	medicationTime: string;
	hasBath: boolean;
}

// フォーム用。id なしで保存時に付与する
export interface SleepRecordInput {
	bedDate: string;
	wakeDate: string;
	bedTime: string;
	wakeTime: string;
	hasCaffeine: boolean;
	caffeineTime: string;
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

export interface PendingCaffeine {
	time: string; // HH:MM
	timestamp: string; // ISO string
}
