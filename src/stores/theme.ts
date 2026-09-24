export const THEMES = ["amber", "oled", "light", "dark", "cappuccino"] as const;

export type Theme = (typeof THEMES)[number];

const STORAGE_KEY = "gallery-theme";
const DEFAULT_THEME: Theme = "oled";

function isTheme(value: string | null): value is Theme {
    return value !== null && THEMES.includes(value as Theme);
}

export function getTheme(): Theme {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (isTheme(saved)) {
        return saved;
    }

    localStorage.setItem(STORAGE_KEY, DEFAULT_THEME);

    return DEFAULT_THEME;
}

export function setTheme(theme: Theme): void {
    localStorage.setItem(STORAGE_KEY, theme);
    document.documentElement.setAttribute("data-theme", theme);
}

export function cycleTheme(): void {
    const current = getTheme();
    const index = THEMES.indexOf(current);
    const next = THEMES[(index + 1) % THEMES.length];

    setTheme(next);
}

export function initTheme(): void {
    setTheme(getTheme());
}
