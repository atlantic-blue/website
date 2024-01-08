export enum ResourceStringLanguage {
    ENGLISH = "en",
    SPANISH = "es",
    FRENCH = "fr",
    PORTUGUESE = "pt",
    RUSSIAN = "ru",
}

export interface ResourceStrings {
    home: {
        section: {
            hero: {
                title: string
                description: string
                cta: string
            }
            intro: {
                content: string
            }
            products: {
                solutions: {
                    imgAlt: string
                    title: string
                    description: string
                },
                methodology: {
                    imgAlt: string
                    title: string
                    description: string
                },
                support: {
                    imgAlt: string
                    title: string
                    description: string
                }
            }
            clients: {
                title: string
            }
            about: {
                title: string
                description: string
                imgAlt: string
            }
        }
    }
}