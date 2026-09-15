import { login } from "@/api/auth";
import { useNavigate } from "@solidjs/router";
import { createSignal } from "solid-js";

export default function Login() {
    const [email, setEmail] = createSignal("");
    const [password, setPassword] = createSignal("");
    const [loading, setLoading] = createSignal(false);
    const [error, setError] = createSignal("");

    const navigate = useNavigate();

    async function handleSubmit(event: SubmitEvent) {
        event.preventDefault();

        setError("");

        if (!email() || !password()) {
            setError("Заполните все поля");
            return;
        }

        setLoading(true);

        try {
            await login(email(), password());

            navigate("/");
        } catch (err) {
            setError(err instanceof Error ? err.message : "Не удалось войти");
        } finally {
            setLoading(false);
        }
    }

    return (
        <main class="auth-page">
            <section class="auth-card">
                <div class="auth-header">
                    <h1>Вход</h1>
                    <p>Войдите в аккаунт Kr</p>
                </div>

                <form
                    class="auth-form"
                    onSubmit={(event) => {
                        void handleSubmit(event);
                    }}
                >
                    <label>
                        <span>Э. Почта</span>
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
                            autocomplete="current-password"
                            value={password()}
                            onInput={(event) =>
                                setPassword(event.currentTarget.value)
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
                        {loading() ? "Вход..." : "Войти"}
                    </button>
                </form>

                <div class="auth-footer">
                    Нет аккаунта? <a href="/register">Зарегистрироваться</a>
                </div>
            </section>
        </main>
    );
}
