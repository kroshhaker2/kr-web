import { cycleTheme } from "@/stores/theme";
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
    return (
        <div class="topbar">
            <button
                class="btn"
                disabled={props.loading || props.page <= 1}
                onClick={props.onPrev}
            >
                ← Назад
            </button>

            <span class="frame-counter">
                <b>{props.page}</b> / {props.totalPages || "—"}
            </span>

            <input
                class="input"
                type="text"
                placeholder="Страница…"
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
                Дальше →
            </button>

            <button class="btn" onClick={cycleTheme}>
                Тема
            </button>

            <UserButton />
        </div>
    );
}
