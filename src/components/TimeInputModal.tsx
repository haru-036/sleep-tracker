import { X } from "lucide-react";

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
	if (!isOpen) return null;

	return (
		// biome-ignore lint/a11y/useSemanticElements: Modal container
		<div
			className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6"
			role="button"
			tabIndex={0}
			onClick={onClose}
			onKeyDown={(event) => {
				if (event.key === "Enter" || event.key === " ") {
					event.preventDefault();
					onClose();
				}
			}}
		>
			<div
				className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 w-full max-w-sm relative"
				role="dialog"
				aria-modal="true"
				onClick={(event) => event.stopPropagation()}
				onKeyDown={(event) => event.stopPropagation()}
			>
				<button
					type="button"
					onClick={onClose}
					className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-200 transition-colors"
				>
					<X className="w-5 h-5" strokeWidth={1.5} />
				</button>

				<h3 className="text-lg font-light text-neutral-200 mb-6 text-center">
					{title}
				</h3>

				<div className="mb-6">
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

				<div className="flex gap-3">
					{showClearButton && onClear && (
						<button
							type="button"
							onClick={onClear}
							className="flex-1 px-6 py-3 border border-neutral-700 text-neutral-400 rounded-full hover:bg-neutral-850 transition-colors text-sm tracking-wide"
						>
							削除
						</button>
					)}
					<button
						type="button"
						onClick={onSave}
						className="flex-1 px-6 py-3 bg-neutral-800 text-neutral-100 rounded-full hover:bg-neutral-750 transition-colors text-sm tracking-wide"
					>
						保存
					</button>
				</div>
			</div>
		</div>
	);
}
