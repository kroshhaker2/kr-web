import { A } from "@solidjs/router";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useI18n } from "@/i18n/context";

export default function Dashboard() {
    const { t } = useI18n();

    return (
        <main class="page admin-dashboard-page">
            <div class="admin-dashboard-container">
                <header class="admin-page-header">
                    <h1>{t("adminDashboard.title")}</h1>
                    <LanguageSwitcher />
                </header>

                <nav class="admin-dashboard-links">
                    <A href="/admin/mod">{t("adminDashboard.moderation")}</A>
                    <A href="/admin/tags">{t("adminDashboard.tags")}</A>
                </nav>
            </div>
        </main>
    );
}
