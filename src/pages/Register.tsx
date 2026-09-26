import { createSignal } from "solid-js";
import { useNavigate } from "@solidjs/router";
import { register } from "@/api/auth";
import { useI18n, type TranslationKey } from "@/i18n/context";
import LanguageSwitcher from "@/components/LanguageSwitcher";

export default function Register() {
    const { t, errorKey } = useI18n();
    const [username, setUsername] = createSignal("");
    const [email, setEmail] = createSignal("");
    const [password, setPassword] = createSignal("");
    const [confirmPassword, setConfirmPassword] = createSignal("");
    const [loading, setLoading] = createSignal(false);
    const [error, setError] = createSignal<TranslationKey | null>(null);

    const navigate = useNavigate();

    async function handleSubmit(event: SubmitEvent) {
        event.preventDefault();

        setError(null);

        if (!username() || !email() || !password() || !confirmPassword()) {
            setError("errors.requiredFields");
            return;
        }

        if (password() !== confirmPassword()) {
            setError("errors.passwordsMismatch");
            return;
        }

        setLoading(true);

        try {
            await register(username(), email(), password());

            navigate("/");
        } catch (err) {
            setError(errorKey(err, "errors.registerFailed"));
        } finally {
            setLoading(false);
        }
    }

    return (
        <main class="auth-page">
            <section class="auth-card">
                <div class="auth-header">
                    <LanguageSwitcher />
                    <h1>{t("auth.register.title")}</h1>
                    <p>{t("auth.register.subtitle")}</p>
                </div>

                <form
                    class="auth-form"
                    onSubmit={(event) => {
                        void handleSubmit(event);
                    }}
                >
                    <label>
                        <span>{t("auth.register.username")}</span>
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
                        <span>{t("auth.register.confirmPassword")}</span>
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

                    {error() && <div class="auth-error">{t(error()!)}</div>}

                    <button
                        class="btn auth-submit"
                        type="submit"
                        disabled={loading()}
                    >
                        {loading()
                            ? t("auth.register.submitting")
                            : t("auth.register.submit")}
                    </button>
                </form>

                <div class="auth-footer">
                    {t("auth.register.hasAccount")} {" "}
                    <a href="/login">{t("auth.register.loginLink")}</a>
                </div>
            </section>
        </main>
    );
}
