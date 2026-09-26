import { API } from "@/config";
import { UserSchema, type User } from "@/types/user";

export async function register(
    username: string,
    email: string,
    password: string,
): Promise<void> {
    const response = await fetch(`${API}/auth/register`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
            username,
            email,
            password,
        }),
    });

    if (!response.ok) {
        throw new Error("errors.registerFailed");
    }
}

export async function login(
    email: string,
    password: string,
): Promise<void> {
    const response = await fetch(`${API}/auth/login`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
            email,
            password,
        }),
    });

    if (!response.ok) {
        throw new Error("errors.invalidCredentials");
    }
}

export async function me(): Promise<User> {
    const response = await fetch(`${API}/auth/me`, {
        credentials: "include",
    });

    if (!response.ok) {
        throw new Error("errors.unauthorized");
    }

    const data: unknown = await response.json();

    return UserSchema.parse(data);
}
