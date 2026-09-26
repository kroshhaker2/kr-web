import { cycleTheme } from "@/stores/theme";
import { useI18n } from "@/i18n/context";
import LanguageSwitcher from "./LanguageSwitcher";
import UserButton from "./UserButton";

interface Props {
    page: number;
    totalPages: number;
    loading: boolean;
    onPrev: () => void;
    onNext: () => void;
    onPage: (page: number) => void;
    user: {
        username: string;
    } | null;
}

export default function TopBar(props: Props) {
    const { t, formatNumber } = useI18n();

    return (
        <div class="topbar">
            <button
                class="btn"
                disabled={props.loading || props.page <= 1}
                onClick={props.onPrev}
            >
                {t("navigation.previous")}
            </button>

            <span class="frame-counter">
                <b>{formatNumber(props.page)}</b> /{" "}
                {props.totalPages
                    ? formatNumber(props.totalPages)
                    : t("common.notAvailable")}
            </span>

            <input
                class="input"
                type="text"
                placeholder={t("navigation.pagePlaceholder")}
                aria-label={t("navigation.pagePlaceholder")}
                inputmode="numeric"
                onKeyDown={(event) => {
                    if (event.key !== "Enter") return;

                    const page = Number(event.currentTarget.value);

                    if (page >= 1 && page <= props.totalPages) {
                        props.onPage(page);
                        event.currentTarget.value = "";
                    }
                }}
            />

            <button
                class="btn"
                disabled={props.loading || props.page >= props.totalPages}
                onClick={props.onNext}
            >
                {t("navigation.next")}
            </button>

            <button class="btn" onClick={cycleTheme}>
                {t("common.theme")}
            </button>

            <LanguageSwitcher />
            <UserButton />
        </div>
    );
}
