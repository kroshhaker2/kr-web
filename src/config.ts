declare global {
    interface Window {
        __KR_CONFIG__: {
            API_URL: string;
        };
    }
}

export const API = window.__KR_CONFIG__.API_URL;