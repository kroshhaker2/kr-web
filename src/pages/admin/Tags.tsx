import { createSignal, For, onMount, Show } from "solid-js";
import { A } from "@solidjs/router";
import {
    createAdminTag,
    deleteAdminTag,
    getAdminTags,
    updateAdminTag,
} from "@/api/admin";
import ErrorList from "@/components/ErrorList";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useI18n } from "@/i18n/context";
import {
    TAG_TYPES,
    type AdminTag,
    type TagInput,
    type TagType,
} from "@/types/admin";

interface TagRowProps {
    tag: AdminTag;
    onUpdate: (id: number, value: TagInput) => Promise<void>;
    onDelete: (id: number) => Promise<void>;
    onValidationError: () => void;
}

function TagRow(props: TagRowProps) {
    const { t } = useI18n();
    const [name, setName] = createSignal(props.tag.name);
    const [type, setType] = createSignal<TagType>(props.tag.type);
    const [saving, setSaving] = createSignal(false);
    const [deleting, setDeleting] = createSignal(false);

    async function save() {
        const normalizedName = name().trim();
        if (!normalizedName) {
            props.onValidationError();
            return;
        }

        setSaving(true);
        try {
            await props.onUpdate(props.tag.id, {
                name: normalizedName,
                type: type(),
            });
        } finally {
            setSaving(false);
        }
    }

    async function remove() {
        setDeleting(true);
        try {
            await props.onDelete(props.tag.id);
        } finally {
            setDeleting(false);
        }
    }

    return (
        <div class="tag-row">
            <span class="tag-id">#{props.tag.id}</span>
            <input
                class="input"
                value={name()}
                maxlength={64}
                aria-label={t("adminTags.name")}
                onInput={(event) => setName(event.currentTarget.value)}
            />
            <select
                class="input"
                value={type()}
                aria-label={t("adminTags.type")}
                onChange={(event) =>
                    setType(event.currentTarget.value as TagType)
                }
            >
                <For each={TAG_TYPES}>
                    {(tagType) => (
                        <option value={tagType}>
                            {t(`tagTypes.${tagType}`)}
                        </option>
                    )}
                </For>
            </select>
            <div class="tag-row-actions">
                <button
                    class="btn"
                    disabled={saving() || deleting()}
                    onClick={() => void save()}
                >
                    {saving() ? t("adminTags.saving") : t("adminTags.save")}
                </button>
                <button
                    class="btn btn-danger"
                    disabled={saving() || deleting()}
                    onClick={() => void remove()}
                >
                    {deleting()
                        ? t("adminTags.deleting")
                        : t("adminTags.delete")}
                </button>
            </div>
        </div>
    );
}

export default function Tags() {
    const { t } = useI18n();
    const [tags, setTags] = createSignal<AdminTag[]>([]);
    const [name, setName] = createSignal("");
    const [type, setType] = createSignal<TagType>("GENERAL");
    const [loading, setLoading] = createSignal(true);
    const [loadFailed, setLoadFailed] = createSignal(false);
    const [creating, setCreating] = createSignal(false);
    const [error, setError] = createSignal<Error | null>(null);

    function normalizeError(error: unknown, fallback: string): Error {
        return error instanceof Error ? error : new Error(fallback);
    }

    async function loadTags(showLoading = true) {
        if (showLoading) setLoading(true);
        setError(null);

        try {
            setTags(await getAdminTags());
            setLoadFailed(false);
        } catch (caught) {
            setLoadFailed(true);
            setError(normalizeError(caught, "errors.tagsLoadFailed"));
        } finally {
            if (showLoading) setLoading(false);
        }
    }

    async function createTag() {
        const normalizedName = name().trim();
        if (!normalizedName) {
            setError(new Error("errors.tagNameRequired"));
            return;
        }

        setCreating(true);
        setError(null);
        try {
            await createAdminTag({ name: normalizedName, type: type() });
            setName("");
            setType("GENERAL");
            await loadTags(false);
        } catch (caught) {
            setError(normalizeError(caught, "errors.tagCreateFailed"));
        } finally {
            setCreating(false);
        }
    }

    async function updateTag(id: number, value: TagInput) {
        setError(null);
        try {
            await updateAdminTag(id, value);
            await loadTags(false);
        } catch (caught) {
            setError(normalizeError(caught, "errors.tagUpdateFailed"));
        }
    }

    async function deleteTag(id: number) {
        setError(null);
        try {
            await deleteAdminTag(id);
            await loadTags(false);
        } catch (caught) {
            setError(normalizeError(caught, "errors.tagDeleteFailed"));
        }
    }

    onMount(() => void loadTags());

    return (
        <main class="page admin-tags-page">
            <div class="admin-tags-container">
                <header class="admin-page-header">
                    <div>
                        <A class="admin-sidebar-back" href="/admin">
                            {t("navigation.dashboard")}
                        </A>
                        <h1>{t("adminTags.title")}</h1>
                        <p>{t("adminTags.subtitle")}</p>
                    </div>
                    <LanguageSwitcher />
                </header>

                <section class="tag-create-card">
                    <h2>{t("adminTags.createTitle")}</h2>
                    <div class="tag-create-form">
                        <label>
                            <span>{t("adminTags.name")}</span>
                            <input
                                class="input"
                                value={name()}
                                maxlength={64}
                                placeholder={t("adminTags.namePlaceholder")}
                                onInput={(event) =>
                                    setName(event.currentTarget.value)
                                }
                            />
                        </label>
                        <label>
                            <span>{t("adminTags.type")}</span>
                            <select
                                class="input"
                                value={type()}
                                onChange={(event) =>
                                    setType(
                                        event.currentTarget.value as TagType,
                                    )
                                }
                            >
                                <For each={TAG_TYPES}>
                                    {(tagType) => (
                                        <option value={tagType}>
                                            {t(`tagTypes.${tagType}`)}
                                        </option>
                                    )}
                                </For>
                            </select>
                        </label>
                        <button
                            class="btn"
                            disabled={creating()}
                            onClick={() => void createTag()}
                        >
                            {creating()
                                ? t("adminTags.creating")
                                : t("adminTags.create")}
                        </button>
                    </div>
                </section>

                <ErrorList
                    error={error()}
                    fallback="errors.tagsLoadFailed"
                />

                <Show
                    when={!loading()}
                    fallback={<div class="status">{t("common.loading")}</div>}
                >
                    <Show when={!loadFailed()}>
                        <Show
                            when={tags().length > 0}
                            fallback={
                                <div class="tags-empty">
                                    {t("adminTags.empty")}
                                </div>
                            }
                        >
                            <section class="tags-list">
                                <div class="tag-list-header">
                                    <span>ID</span>
                                    <span>{t("adminTags.name")}</span>
                                    <span>{t("adminTags.type")}</span>
                                    <span>{t("adminTags.actions")}</span>
                                </div>
                                <For each={tags()}>
                                    {(tag) => (
                                        <TagRow
                                            tag={tag}
                                            onUpdate={updateTag}
                                            onDelete={deleteTag}
                                            onValidationError={() =>
                                                setError(
                                                    new Error(
                                                        "errors.tagNameRequired",
                                                    ),
                                                )
                                            }
                                        />
                                    )}
                                </For>
                            </section>
                        </Show>
                    </Show>
                </Show>
            </div>
        </main>
    );
}
