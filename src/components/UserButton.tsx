import { auth } from "@/stores/auth";
import { useNavigate } from "@solidjs/router";
import { Show } from "solid-js";
import { useI18n } from "@/i18n/context";

export default function UserButton() {
    const navigate = useNavigate();
    const user = auth.user;
    const { t } = useI18n();

    return (
        <Show
            when={user()}
            fallback={
                <button class="btn" onClick={() => navigate("/login")}>
                    {t("common.signIn")}
                </button>
            }
        >
            {(currentUser) => (
                <button class="btn user-button">
                    <span class="user-button-avatar">
                        {currentUser().username[0]?.toUpperCase()}
                    </span>

                    <span class="user-button-name">
                        {currentUser().username}
                    </span>
                </button>
            )}
        </Show>
    );
}
