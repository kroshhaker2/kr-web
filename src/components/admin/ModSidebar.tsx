import { createSignal } from "solid-js";
import { A } from "@solidjs/router";

interface Filters {
    tags: string[];
    author: string;
    type: "image" | "animated" | "";
}

interface ModSidebarProps {
    selectedCount: number;
    onAddTag: (tag: string) => void;
    onRemoveTag: (tag: string) => void;
    onDeleteSelected: () => void;
    onFilterChange: (query: string) => void;
}

export default function ModSidebar(props: ModSidebarProps) {
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
                    ← Dashboard
                </A>
            </div>

            <div class="admin-sidebar-filters">
                <h3>Фильтры</h3>

                <label>
                    Поиск
                    <input
                        class="input"
                        type="text"
                        placeholder="автор type:gif тег..."
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
                    Выбрано: {props.selectedCount}
                </span>

                <input
                    class="input"
                    type="text"
                    placeholder="Название тега..."
                    value={tagValue()}
                    onInput={(e) => setTagValue(e.currentTarget.value)}
                />

                <button
                    class="btn"
                    disabled={props.selectedCount === 0 || !tagValue().trim()}
                    onClick={() => submitTag(props.onAddTag)}
                >
                    Добавить тег
                </button>

                <button
                    class="btn"
                    disabled={props.selectedCount === 0 || !tagValue().trim()}
                    onClick={() => submitTag(props.onRemoveTag)}
                >
                    Удалить тег
                </button>

                <button
                    class="btn btn-danger"
                    disabled={props.selectedCount === 0}
                    onClick={props.onDeleteSelected}
                >
                    Удалить выбранное
                </button>
            </div>
        </aside>
    );
}
