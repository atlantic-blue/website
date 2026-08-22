import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import type { ComponentProps } from "react"

import { cn } from "@/lib/cn"

/**
 * Square corners, no shadow, a 44 pixel minimum target. See DESIGN.md.
 * asChild lets a link render as a button without nesting an anchor in one.
 */
const button = cva(
    "inline-flex items-center justify-center min-h-11 px-3 text-[0.9375rem] font-medium border transition-opacity duration-150 no-underline hover:no-underline",
    {
        variants: {
            variant: {
                solid: "bg-accent-solid text-on-accent border-accent-solid hover:opacity-88",
                quiet: "bg-transparent text-ink border-line hover:border-accent",
            },
        },
        defaultVariants: { variant: "solid" },
    },
)

type ButtonProps = ComponentProps<"button"> &
    VariantProps<typeof button> & {
        asChild?: boolean
    }

export const Button = ({ className, variant, asChild = false, ...props }: ButtonProps) => {
    const Component = asChild ? Slot : "button"
    return <Component className={cn(button({ variant }), className)} {...props} />
}
