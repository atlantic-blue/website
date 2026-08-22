/**
 * Facts about the company that more than one page needs.
 * A United Kingdom limited company must show the registered name, the company
 * number and the registered office on its website.
 */
export interface Company {
    readonly legalName: string
    readonly tradingName: string
    readonly companyNumber: string
    readonly registeredOffice: readonly string[]
    readonly email: string
    readonly origin: string
}

export const company: Company = {
    legalName: "Atlantic Blue Solutions Ltd",
    tradingName: "Atlantic Blue",
    companyNumber: "14468993",
    registeredOffice: ["86-90 Paul Street", "London", "EC2A 4NE", "United Kingdom"],
    email: "hello@atlanticblue.solutions",
    origin: "https://atlanticblue.solutions",
}

/**
 * Clients we may name. Naming them is agreed. Anything specific about their
 * systems, their numbers or their roadmap is theirs, so nothing here carries a
 * metric. See DESIGN.md, "Confidentiality".
 */
export const clients: readonly string[] = [
    "ITV",
    "Sky",
    "Peacock",
    "NBCUniversal",
    "DAZN",
    "castLabs",
    "Utility Warehouse",
    "Plentific",
]
