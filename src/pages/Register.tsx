import { createSignal } from "solid-js";
import { useNavigate } from "@solidjs/router";
import { register } from "@/api/auth";

export default function Register() {
    const [username, setUsername] = createSignal("");
    const [email, setEmail] = createSignal("");
    const [password, setPassword] = createSignal("");
    const [confirmPassword, setConfirmPassword] = createSignal("");
    const [loading, setLoading] = createSignal(false);
    const [error, setError] = createSignal("");

    const navigate = useNavigate();

    async function handleSubmit(event: SubmitEvent) {
        event.preventDefault();

        setError("");

        if (!username() || !email() || !password() || !confirmPassword()) {
            setError("Заполните все поля");
            return;
        }

        if (password() !== confirmPassword()) {
            setError("Пароли не совпадают");
            return;
        }

        setLoading(true);

        try {
            await register(username(), email(), password());

            navigate("/");
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Не удалось зарегистрироваться",
            );
        } finally {
            setLoading(false);
        }
    }

    return (
        <main class="auth-page">
            <section class="auth-card">
                <div class="auth-header">
                    <h1>Регистрация</h1>
                    <p>Создайте аккаунт Kr</p>
                </div>

                <form
                    class="auth-form"
                    onSubmit={(event) => {
                        void handleSubmit(event);
                    }}
                >
                    <label>
                        <span>Имя пользователя</span>
                        <input
                            class="input"
                            type="text"
                            autocomplete="username"
                            value={username()}
                            onInput={(event) =>
                                setUsername(event.currentTarget.value)
                            }
                            disabled={loading()}
                            required
                        />
                    </label>

                    <label>
                        <span>Email</span>
                        <input
                            class="input"
                            type="email"
                            autocomplete="email"
                            value={email()}
                            onInput={(event) =>
                                setEmail(event.currentTarget.value)
                            }
                            disabled={loading()}
                            required
                        />
                    </label>

                    <label>
                        <span>Пароль</span>
                        <input
                            class="input"
                            type="password"
                            autocomplete="new-password"
                            value={password()}
                            onInput={(event) =>
                                setPassword(event.currentTarget.value)
                            }
                            disabled={loading()}
                            required
                        />
                    </label>

                    <label>
                        <span>Повторите пароль</span>
                        <input
                            class="input"
                            type="password"
                            autocomplete="new-password"
                            value={confirmPassword()}
                            onInput={(event) =>
                                setConfirmPassword(event.currentTarget.value)
                            }
                            disabled={loading()}
                            required
                        />
                    </label>

                    {error() && <div class="auth-error">{error()}</div>}

                    <button
                        class="btn auth-submit"
                        type="submit"
                        disabled={loading()}
                    >
                        {loading() ? "Регистрация..." : "Зарегистрироваться"}
                    </button>
                </form>

                <div class="auth-footer">
                    Уже есть аккаунт? <a href="/login">Войти</a>
                </div>
            </section>
        </main>
    );
}
