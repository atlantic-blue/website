import { createContext, useContext } from "react"

interface Config {

}

const ConfigContext = createContext<Config>({});

const useConfig = (): Config => {
    const config = useContext(ConfigContext);
    if (!config) {
        throw new Error("Configuration context not initialized!");
    }
    return config;
}

export {
    useConfig,
    ConfigContext as default,
};
