"use client"

import { useSyncExternalStore } from "react"

import { Button } from "@/components/ui/button"
import {
    askTheVisitorAgain,
    isAskingTheVisitor,
    keepConsent,
    whenTheAnswerChanges,
    type Consent,
} from "@/lib/consent"

/**
 * The answer is read in the browser, not on the server. A server read of the
 * cookie makes every page dynamic, and CloudFront then holds one visitor's
 * answer in the cache for everybody who asks after them.
 */
export const ConsentBanner = () => {
    const asking = useSyncExternalStore(whenTheAnswerChanges, isAskingTheVisitor, () => false)

    const answer = (choice: Consent) => () => {
        keepConsent(choice)
    }

    return (
        <div id="consent-banner">
            {asking ? (
                <div
                    role="region"
                    aria-label="Cookies"
                    className="fixed inset-x-0 bottom-0 z-50 border-t border-line bg-surface px-4 py-4 sm:px-6 lg:px-8"
                >
                    <div className="mx-auto flex max-w-[1180px] flex-col gap-4 lg:flex-row lg:items-center lg:justify-between lg:gap-10">
                        <p className="text-[0.9375rem] text-ink">
                            We count visits with Google Analytics only if you accept.{" "}
                            <a href="/cookies" className="text-accent">
                                Cookie policy
                            </a>
                        </p>
                        <div className="flex gap-2">
                            <Button
                                variant="quiet"
                                className="min-w-[132px] flex-1"
                                onClick={answer("granted")}
                            >
                                Accept
                            </Button>
                            <Button
                                variant="quiet"
                                className="min-w-[132px] flex-1"
                                onClick={answer("denied")}
                            >
                                Reject
                            </Button>
                        </div>
                    </div>
                </div>
            ) : null}
        </div>
    )
}

export const CookieSettings = () => (
    <button
        type="button"
        onClick={askTheVisitorAgain}
        className="text-ink no-underline hover:text-accent hover:underline"
    >
        Cookie settings
    </button>
)
