import { createSignal } from "solid-js";
import { A } from "@solidjs/router";
import { useI18n } from "@/i18n/context";

interface ModSidebarProps {
    selectedCount: number;
    onAddTag: (tag: string) => void;
    onRemoveTag: (tag: string) => void;
    onDeleteSelected: () => void;
    onFilterChange: (query: string) => void;
}

export default function ModSidebar(props: ModSidebarProps) {
    const { t, formatNumber } = useI18n();
    const [tagValue, setTagValue] = createSignal("");
    const [filterQuery, setFilterQuery] = createSignal("");

    function submitTag(action: (tag: string) => void) {
        const tag = tagValue().trim();
        if (!tag) return;
        action(tag);
        setTagValue("");
    }

    return (
        <aside class="admin-sidebar">
            <div class="admin-sidebar-header">
                <A class="admin-sidebar-back" href="/admin">
                    {t("navigation.dashboard")}
                </A>
            </div>

            <div class="admin-sidebar-filters">
                <h3>{t("sidebar.filters")}</h3>

                <label>
                    {t("sidebar.search")}
                    <input
                        class="input"
                        type="text"
                        placeholder={t("sidebar.searchPlaceholder")}
                        value={filterQuery()}
                        onInput={(e) => {
                            setFilterQuery(e.currentTarget.value);
                            props.onFilterChange(e.currentTarget.value);
                        }}
                    />
                </label>
            </div>

            <div class="admin-sidebar-actions">
                <span class="selection-count">
                    {t("sidebar.selected", {
                        count: formatNumber(props.selectedCount),
                    })}
                </span>

                <input
                    class="input"
                    type="text"
                    placeholder={t("sidebar.tagPlaceholder")}
                    value={tagValue()}
                    onInput={(e) => setTagValue(e.currentTarget.value)}
                />

                <button
                    class="btn"
                    disabled={props.selectedCount === 0 || !tagValue().trim()}
                    onClick={() => submitTag(props.onAddTag)}
                >
                    {t("sidebar.addTag")}
                </button>

                <button
                    class="btn"
                    disabled={props.selectedCount === 0 || !tagValue().trim()}
                    onClick={() => submitTag(props.onRemoveTag)}
                >
                    {t("sidebar.removeTag")}
                </button>

                <button
                    class="btn btn-danger"
                    disabled={props.selectedCount === 0}
                    onClick={props.onDeleteSelected}
                >
                    {t("sidebar.deleteSelected")}
                </button>
            </div>
        </aside>
    );
}
