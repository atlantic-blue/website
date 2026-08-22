import type { ComponentProps } from "react"

import { cn } from "@/lib/cn"

/**
 * One container, so page padding and rhythm are decided once. Mobile first:
 * 16px of padding on a phone, growing at the breakpoints.
 */
export const Section = ({ className, ...props }: ComponentProps<"section">) => (
    <section
        className={cn(
            "mx-auto max-w-[1180px] px-4 py-10 sm:px-6 sm:py-14 lg:px-8 lg:py-16",
            className,
        )}
        {...props}
    />
)

export const Eyebrow = ({ className, ...props }: ComponentProps<"p">) => (
    <p
        className={cn("font-mono text-xs uppercase tracking-[0.12em] text-dim", className)}
        {...props}
    />
)

export const Title = ({ className, ...props }: ComponentProps<"h1">) => (
    <h1
        className={cn(
            "mt-4 text-[clamp(2rem,7vw,4.2rem)] leading-[1.05] tracking-[-0.03em]",
            className,
        )}
        {...props}
    />
)

export const Heading = ({ className, ...props }: ComponentProps<"h2">) => (
    <h2
        className={cn(
            "text-[clamp(1.5rem,4.5vw,2.4rem)] leading-[1.12] tracking-[-0.02em]",
            className,
        )}
        {...props}
    />
)

export const Lede = ({ className, ...props }: ComponentProps<"p">) => (
    <p className={cn("mt-4 max-w-[52ch] text-base text-dim sm:text-lg", className)} {...props} />
)
