interface Env {
    analytics: {
        mixpanelToken: string
    }
}

const environment: Env = {
    analytics: {
        mixpanelToken: process.env.MIXPANEL_TOKEN || ""
    }
}

export default environment
