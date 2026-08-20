import { company } from "./site"

/**
 * The build writes each page as a file, so `about.astro` becomes `about.html`
 * and the request path Astro reports carries that extension. CloudFront serves
 * those files at an address with no extension, so the canonical link has to be
 * normalised or every page would declare a canonical nobody can reach.
 */
export const canonicalPath = (pathname: string): string => {
    const withoutIndex = pathname.replace(/\/index\.html$/, "/")
    const withoutExtension = withoutIndex.replace(/\.html$/, "")
    const trimmed = withoutExtension.replace(/\/+$/, "")
    return trimmed === "" ? "/" : trimmed
}

export const canonicalUrl = (pathname: string): string =>
    new URL(canonicalPath(pathname), company.origin).href
