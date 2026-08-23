import { services } from "./services"

/**
 * The whole site in one place, used by the footer so every page is reachable
 * from every page. A consultancy site is judged partly on depth, and depth that
 * cannot be found is the same as no depth.
 */
export const footerNav = [
    {
        heading: "Specialism",
        links: services
            .filter((service) => service.group === "specialism")
            .map((service) => ({ href: `/services/${service.slug}`, label: service.name })),
    },
    {
        heading: "Practice",
        links: services
            .filter((service) => service.group === "practice")
            .map((service) => ({ href: `/services/${service.slug}`, label: service.name })),
    },
    {
        heading: "Company",
        links: [{ href: "/services", label: "All services" }],
    },
] as const
