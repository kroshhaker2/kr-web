import { auth } from "@/stores/auth";
import { Navigate } from "@solidjs/router";
import type { ParentProps } from "solid-js";

export default function AdminLayout(props: ParentProps) {
    if (auth.initialized() && !auth.isAuthenticated()) {
        return <Navigate href="/login" />;
    }

    if (auth.initialized() && auth.user()?.role !== "ADMIN") {
        return <Navigate href="/" />;
    }

    return (
        <div>
            {/* sidebar/header */}

            {props.children}
        </div>
    );
}
