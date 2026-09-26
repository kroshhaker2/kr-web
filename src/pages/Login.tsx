import { login } from "@/api/auth";
import { useNavigate } from "@solidjs/router";
import { createSignal } from "solid-js";
import { useI18n } from "@/i18n/context";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import ErrorList from "@/components/ErrorList";

export default function Login() {
    const { t } = useI18n();
    const [email, setEmail] = createSignal("");
    const [password, setPassword] = createSignal("");
    const [loading, setLoading] = createSignal(false);
    const [error, setError] = createSignal<Error | null>(null);

    const navigate = useNavigate();

    async function handleSubmit(event: SubmitEvent) {
        event.preventDefault();

        setError(null);

        if (!email() || !password()) {
            setError(new Error("errors.requiredFields"));
            return;
        }

        setLoading(true);

        try {
            await login(email(), password());

            navigate("/");
        } catch (err) {
            setError(
                err instanceof Error ? err : new Error("errors.loginFailed"),
            );
        } finally {
            setLoading(false);
        }
    }

    return (
        <main class="auth-page">
            <section class="auth-card">
                <div class="auth-header">
                    <LanguageSwitcher />
                    <h1>{t("auth.login.title")}</h1>
                    <p>{t("auth.login.subtitle")}</p>
                </div>

                <form
                    class="auth-form"
                    onSubmit={(event) => {
                        void handleSubmit(event);
                    }}
                >
                    <label>
                        <span>{t("auth.email")}</span>
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
                        <span>{t("auth.password")}</span>
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

                    <ErrorList
                        class="auth-error error-list"
                        error={error()}
                        fallback="errors.loginFailed"
                    />

                    <button
                        class="btn auth-submit"
                        type="submit"
                        disabled={loading()}
                    >
                        {loading()
                            ? t("auth.login.submitting")
                            : t("common.signIn")}
                    </button>
                </form>

                <div class="auth-footer">
                    {t("auth.login.noAccount")} {" "}
                    <a href="/register">{t("auth.login.registerLink")}</a>
                </div>
            </section>
        </main>
    );
}
