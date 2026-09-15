import { createSignal } from "solid-js";
import type { User } from "@/types/user";
import { me } from "@/api/auth";

const [user, setUser] = createSignal<User | null>(null);
const [initialized, setInitialized] = createSignal(false);

export const auth = {
    user,
    initialized,

    setUser,
    setInitialized,

    logout(): void {
        setUser(null);
    },

    isAuthenticated(): boolean {
        return user() !== null;
    },
};

export async function loadUser() {
    try {
        const user = await me();
        auth.setUser(user);
    } catch {
        auth.setUser(null);
    } finally {
        auth.setInitialized(true);
    }
}
