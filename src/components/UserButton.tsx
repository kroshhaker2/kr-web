import { auth } from "@/stores/auth";
import { useNavigate } from "@solidjs/router";
import { Show } from "solid-js";

export default function UserButton() {
    const navigate = useNavigate();
    const user = auth.user;

    return (
        <Show
            when={user()}
            fallback={
                <button class="btn" onClick={() => navigate("/login")}>
                    Войти
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
