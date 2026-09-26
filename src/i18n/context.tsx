/* eslint-disable react-refresh/only-export-components */
import { flatten, resolveTemplate, translator } from "@solid-primitives/i18n";
import {
    createContext,
    createEffect,
    createSignal,
    useContext,
    type Accessor,
    type ParentProps,
} from "solid-js";
import { en } from "./dictionaries/en";
import { ru } from "./dictionaries/ru";
import { ApiError, type ValidationDetail } from "@/api/errors";

export const LOCALES = ["ru", "en"] as const;
export type Locale = (typeof LOCALES)[number];

const STORAGE_KEY = "kr-locale";
const dictionaries = {
    ru: flatten(ru),
    en: flatten(en),
};

export type TranslationKey = keyof (typeof dictionaries)["ru"];
type TemplateValues = Record<string, string | number | boolean>;
type PluralKey =
    | "moderation.pendingPosts"
    | "moderation.views"
    | "moderation.favorites";

interface I18nContextValue {
    locale: Accessor<Locale>;
    setLocale: (locale: Locale) => void;
    toggleLocale: () => void;
    t: (key: TranslationKey, values?: TemplateValues) => string;
    plural: (key: PluralKey, count: number) => string;
    formatDate: (value: string | Date | null) => string;
    formatNumber: (value: number) => string;
    formatFileSize: (bytes: number, fractionDigits?: number) => string;
    errorKey: (error: unknown, fallback: TranslationKey) => TranslationKey;
    errorMessages: (error: Error, fallback: TranslationKey) => string[];
}

const I18nContext = createContext<I18nContextValue>();

function isLocale(value: string | null): value is Locale {
    return value !== null && LOCALES.includes(value as Locale);
}

function initialLocale(): Locale {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (isLocale(saved)) return saved;
    return navigator.language.toLowerCase().startsWith("ru") ? "ru" : "en";
}

export function I18nProvider(props: ParentProps) {
    const [locale, setLocaleSignal] = createSignal<Locale>(initialLocale());
    const translate = translator(() => dictionaries[locale()], resolveTemplate);

    const t = (key: TranslationKey, values?: TemplateValues): string => {
        const translated = translate(key, values);
        return typeof translated === "string" ? translated : String(key);
    };

    const setLocale = (nextLocale: Locale) => {
        setLocaleSignal(nextLocale);
        localStorage.setItem(STORAGE_KEY, nextLocale);
    };

    const localeTag = () => (locale() === "ru" ? "ru-RU" : "en-US");

    const plural = (key: PluralKey, count: number): string => {
        const category = new Intl.PluralRules(localeTag()).select(count);
        const candidate = `${key}.${category}` as TranslationKey;
        const fallback = `${key}.other` as TranslationKey;
        const dictionary = dictionaries[locale()] as Record<string, unknown>;

        const formattedCount = new Intl.NumberFormat(localeTag()).format(count);
        return t(candidate in dictionary ? candidate : fallback, {
            count: formattedCount,
        });
    };

    const formatDate = (value: string | Date | null): string => {
        if (!value) return t("common.notAvailable");
        const date = value instanceof Date ? value : new Date(value);
        if (Number.isNaN(date.getTime())) return String(value);

        return new Intl.DateTimeFormat(localeTag(), {
            dateStyle: "medium",
            timeStyle: "short",
        }).format(date);
    };

    const formatNumber = (value: number): string =>
        new Intl.NumberFormat(localeTag()).format(value);

    const formatFileSize = (bytes: number, fractionDigits = 1): string => {
        const formatter = new Intl.NumberFormat(localeTag(), {
            maximumFractionDigits: fractionDigits,
        });

        if (bytes < 1024 * 1024) {
            return `${formatter.format(bytes / 1024)} ${locale() === "ru" ? "КБ" : "KB"}`;
        }

        return `${formatter.format(bytes / 1024 / 1024)} ${locale() === "ru" ? "МБ" : "MB"}`;
    };

    const errorKey = (
        error: unknown,
        fallback: TranslationKey,
    ): TranslationKey => {
        if (error instanceof Error && error.message.startsWith("errors.")) {
            const key = error.message as TranslationKey;
            if (key in dictionaries.ru) return key;
        }

        return fallback;
    };

    const apiErrorKeys: Partial<Record<string, TranslationKey>> = {
        INVALID_CREDENTIALS: "errors.invalidCredentials",
        UNAUTHORIZED: "errors.unauthorized",
        EMAIL_ALREADY_EXISTS: "errors.emailAlreadyExists",
        USERNAME_ALREADY_EXISTS: "errors.usernameAlreadyExists",
        PASSWORD_TOO_WEAK: "errors.passwordTooWeak",
        PASSWORD_COMPROMISED: "errors.passwordCompromised",
        PASSWORD_TOO_SHORT: "errors.passwordTooShort",
        PASSWORD_TOO_LONG: "errors.passwordTooLong",
        USERNAME_TOO_SHORT: "errors.usernameTooShort",
        USERNAME_TOO_LONG: "errors.usernameTooLong",
        USERNAME_INVALID_CHARACTERS: "errors.usernameInvalidCharacters",
        INVALID_EMAIL: "errors.invalidEmail",
        INVALID_USERNAME: "errors.invalidUsername",
        FILE_REQUIRED: "errors.fileRequired",
        UNSUPPORTED_FILE_TYPE: "errors.uploadType",
    };

    const validationFieldKeys: Partial<Record<string, TranslationKey>> = {
        email: "errors.validationFields.email",
        username: "errors.validationFields.username",
        password: "errors.validationFields.password",
        title: "errors.validationFields.title",
        description: "errors.validationFields.description",
        tags: "errors.validationFields.tags",
        rating: "errors.validationFields.rating",
        sourceUrl: "errors.validationFields.sourceUrl",
        suggestedTags: "errors.validationFields.suggestedTags",
        status: "errors.validationFields.status",
        reason: "errors.validationFields.reason",
        file: "errors.validationFields.file",
    };

    const validationMessage = (detail: ValidationDetail): string => {
        const messageKey = apiErrorKeys[detail.message];
        if (messageKey) return t(messageKey);

        const pathSegments = detail.path.split(".");
        const fieldName = [...pathSegments]
            .reverse()
            .find((segment) => segment in validationFieldKeys);

        if (fieldName === "email") return t("errors.invalidEmail");
        if (fieldName === "username") return t("errors.invalidUsername");
        if (fieldName === "password") return t("errors.invalidPassword");

        const fieldKey = fieldName
            ? validationFieldKeys[fieldName]
            : undefined;
        const field = fieldKey ? t(fieldKey) : detail.path || detail.code;
        return t("errors.invalidField", { field });
    };

    const errorMessages = (
        error: Error,
        fallback: TranslationKey,
    ): string[] => {
        if (error instanceof ApiError) {
            if (error.code === "VALIDATION_ERROR" && error.details.length > 0) {
                return error.details.map(validationMessage);
            }

            const apiErrorKey = apiErrorKeys[error.code];
            if (apiErrorKey) return [t(apiErrorKey)];
        }

        return [t(errorKey(error, fallback))];
    };

    createEffect(() => {
        document.documentElement.setAttribute("lang", locale());
        document.querySelector("title")?.replaceChildren(t("app.title"));
    });

    const value: I18nContextValue = {
        locale,
        setLocale,
        toggleLocale: () => setLocale(locale() === "ru" ? "en" : "ru"),
        t,
        plural,
        formatDate,
        formatNumber,
        formatFileSize,
        errorKey,
        errorMessages,
    };

    return (
        <I18nContext.Provider value={value}>
            {props.children}
        </I18nContext.Provider>
    );
}

export function useI18n(): I18nContextValue {
    const context = useContext(I18nContext);
    if (!context) throw new Error("I18nProvider is missing");
    return context;
}
