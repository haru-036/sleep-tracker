import { Bath, ChartNoAxesGantt, Coffee, Moon, Pill, Sun } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { SleepRecord } from "../types/sleep";

interface RecordsListProps {
  records: SleepRecord[];
  formatDate: (dateStr: string) => string;
  onEditRecord: (record: SleepRecord) => void;
}

function formatDurationDecimal(
  bedDate: string,
  bedTime: string,
  wakeDate: string,
  wakeTime: string,
): string | null {
  if (!bedDate || !bedTime || !wakeDate || !wakeTime) return null;
  const bed = new Date(`${bedDate}T${bedTime}:00`);
  const wake = new Date(`${wakeDate}T${wakeTime}:00`);
  const totalMinutes = Math.floor((wake.getTime() - bed.getTime()) / 60000);
  if (totalMinutes <= 0) return null;
  const hours = Math.round((totalMinutes / 60) * 10) / 10;
  return `${hours}h`;
}

export function RecordsList({
  records,
  formatDate,
  onEditRecord,
}: RecordsListProps) {
  if (records.length === 0) {
    return (
      <div className="text-center py-16 text-neutral-600">
        <div className="w-16 h-16 mx-auto mb-4 bg-neutral-900 border border-neutral-800 rounded-full flex items-center justify-center">
          <ChartNoAxesGantt
            className="w-8 h-8 text-neutral-700"
            strokeWidth={1.5}
          />
        </div>
        <p className="text-sm tracking-wide">記録はまだありません</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-neutral-800/60">
      {records.map((record) => {
        const duration = formatDurationDecimal(
          record.bedDate,
          record.bedTime,
          record.wakeDate,
          record.wakeTime,
        );
        const hasBadges =
          record.hasCaffeine || record.hasBath || record.hasMedication;

        return (
          <button
            key={record.id}
            type="button"
            onClick={() => onEditRecord(record)}
            className="flex flex-col gap-2 w-full text-left py-5 px-3 transition-colors hover:bg-neutral-900/40"
          >
            <div className="flex items-center gap-3">
              <span className="text-xs text-neutral-600 tracking-wide w-10 shrink-0">
                {formatDate(record.wakeDate)}
              </span>
              <div className="flex items-center gap-1.5 text-neutral-300 text-sm font-light tracking-wide shrink-0">
                <Moon className="w-3 h-3 shrink-0" strokeWidth={1.5} />
                <span>{record.bedTime}</span>
              </div>
              <div className="flex items-center gap-1.5 text-neutral-300 text-sm font-light tracking-wide shrink-0">
                <Sun className="w-3 h-3 shrink-0" strokeWidth={1.5} />
                <span>{record.wakeTime}</span>
              </div>
              {duration && (
                <span className="text-xs text-neutral-600 font-light tracking-wide ml-auto">
                  {duration}
                </span>
              )}
            </div>

            {hasBadges && (
              <div className="flex items-center gap-1.5 ml-12">
                {record.hasCaffeine && (
                  <Badge>
                    <Coffee strokeWidth={1.5} />
                    {record.caffeineTime && <span>{record.caffeineTime}</span>}
                  </Badge>
                )}
                {record.hasBath && (
                  <Badge>
                    <Bath strokeWidth={1.5} />
                  </Badge>
                )}
                {record.hasMedication && (
                  <Badge>
                    <Pill strokeWidth={1.5} />
                    {record.medicationTime && (
                      <span>{record.medicationTime}</span>
                    )}
                  </Badge>
                )}
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}
