import type * as React from "react";

import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
	const isTimeInput = type === "time";

	return (
		<input
			type={type}
			data-slot="input"
			className={cn(
				"w-full px-4 py-3 bg-neutral-800 border border-neutral-700 text-neutral-100 rounded-2xl focus:border-neutral-600 focus:outline-none font-light transition-colors appearance-none [-webkit-appearance:none]",
				isTimeInput && "text-center text-lg",
				!isTimeInput && "text-base",
				"placeholder:text-neutral-500",
				"disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
				className,
			)}
			style={{ boxSizing: "border-box" }}
			{...props}
		/>
	);
}

export { Input };
