import { useI18n } from "@/i18n/context";

export default function LanguageSwitcher() {
    const { locale, toggleLocale, t } = useI18n();

    return (
        <button
            class="btn language-switcher"
            type="button"
            aria-label={t("common.language")}
            title={locale() === "ru" ? t("common.english") : t("common.russian")}
            onClick={toggleLocale}
        >
            {locale() === "ru" ? "EN" : "RU"}
        </button>
    );
}
