import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import type * as React from "react";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
	"inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-light tracking-wide transition-colors disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
	{
		variants: {
			variant: {
				default:
					"bg-neutral-700 text-neutral-100 hover:bg-neutral-600 rounded-full",
				outline:
					"border border-neutral-700/80 text-neutral-300/90 hover:bg-neutral-800 rounded-full",
				secondary:
					"bg-neutral-800 text-neutral-100 hover:bg-neutral-700 rounded-full",
				ghost: "hover:bg-neutral-800 hover:text-neutral-100 rounded-full",
				link: "text-neutral-300 underline-offset-4 hover:underline",
				destructive:
					"bg-destructive text-white hover:bg-destructive/90 rounded-full",
			},
			size: {
				default: "h-11 px-6 py-3",
				sm: "h-9 px-4 py-2",
				lg: "h-12 px-8 py-4",
				icon: "size-10 rounded-full",
				"icon-sm": "size-8 rounded-full",
				"icon-lg": "size-14 rounded-full",
			},
		},
		defaultVariants: {
			variant: "default",
			size: "default",
		},
	},
);

function Button({
	className,
	variant = "default",
	size = "default",
	asChild = false,
	...props
}: React.ComponentProps<"button"> &
	VariantProps<typeof buttonVariants> & {
		asChild?: boolean;
	}) {
	const Comp = asChild ? Slot : "button";

	return (
		<Comp
			data-slot="button"
			data-variant={variant}
			data-size={size}
			className={cn(buttonVariants({ variant, size, className }))}
			{...props}
		/>
	);
}

export { Button, buttonVariants };
