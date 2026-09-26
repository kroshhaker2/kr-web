import { Navigate } from "@solidjs/router";
import { Show } from "solid-js";
import type { ParentProps } from "solid-js";
import { auth } from "@/stores/auth";
import { useI18n } from "@/i18n/context";

export default function AdminLayout(props: ParentProps) {
    const { t } = useI18n();

    return (
        <Show when={auth.initialized()} fallback={<div>{t("common.loading")}</div>}>
            <Show when={auth.user()} fallback={<Navigate href="/login" />}>
                {(user) => (
                    <Show
                        when={user().role === "ADMIN"}
                        fallback={<Navigate href="/" />}
                    >
                        <div>
                            {/* sidebar/header */}

                            {props.children}
                        </div>
                    </Show>
                )}
            </Show>
        </Show>
    );
}
