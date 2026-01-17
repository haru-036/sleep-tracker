import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";

interface TimeInputModalProps {
	isOpen: boolean;
	title: string;
	label: string;
	time: string;
	onTimeChange: (value: string) => void;
	onClose: () => void;
	onSave: () => void;
	onClear?: () => void;
	showClearButton?: boolean;
}

export function TimeInputModal({
	isOpen,
	title,
	label,
	time,
	onTimeChange,
	onClose,
	onSave,
	onClear,
	showClearButton = false,
}: TimeInputModalProps) {
	return (
		<Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>{title}</DialogTitle>
				</DialogHeader>

				<div className="mb-2">
					<label
						htmlFor="time-input"
						className="text-xs text-neutral-400 mb-2 block tracking-wide"
					>
						{label}
					</label>
					<input
						type="time"
						id="time-input"
						value={time}
						onChange={(event) => onTimeChange(event.target.value)}
						className="w-full max-w-full px-4 py-3 bg-neutral-800 border border-neutral-700 text-neutral-100 rounded-2xl focus:border-neutral-600 focus:outline-none text-xl font-light text-center appearance-none [-webkit-appearance:none]"
						style={{ boxSizing: "border-box" }}
					/>
				</div>

				<DialogFooter>
					{showClearButton && onClear && (
						<Button variant="outline" className="flex-1" onClick={onClear}>
							削除
						</Button>
					)}
					<Button variant="secondary" className="flex-1" onClick={onSave}>
						保存
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
