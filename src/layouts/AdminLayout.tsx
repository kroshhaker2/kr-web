import { Navigate } from "@solidjs/router";
import { Show } from "solid-js";
import type { ParentProps } from "solid-js";
import { auth } from "@/stores/auth";

export default function AdminLayout(props: ParentProps) {
    return (
        <Show when={auth.initialized()} fallback={<div>Loading...</div>}>
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
