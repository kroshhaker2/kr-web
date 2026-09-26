import { createEffect, createSignal, Show } from "solid-js";
import { getPendingModerationPost, moderatePost } from "@/api/admin";
import type {
    ModerationCommand,
    ModerationPost,
    ModerationPostChanges,
} from "@/types/admin";
import { useI18n, type TranslationKey } from "@/i18n/context";
import LanguageSwitcher from "@/components/LanguageSwitcher";

const EMPTY_CHANGES: ModerationPostChanges = {
    title: null,
    description: null,
    rating: "SAFE",
    tags: [],
    suggestedTags: null,
    sourceUrl: null,
};

export default function Moderation() {
    const {
        t,
        plural,
        formatDate,
        formatFileSize,
        errorKey,
    } = useI18n();
    const [post, setPost] = createSignal<ModerationPost | null>(null);

    const [loading, setLoading] = createSignal(true);
    const [actionLoading, setActionLoading] = createSignal(false);
    const [error, setError] = createSignal<TranslationKey | null>(null);

    const [rejecting, setRejecting] = createSignal(false);
    const [reason, setReason] = createSignal("");
    const [tagsInput, setTagsInput] = createSignal("");
    const [changes, setChanges] =
        createSignal<ModerationPostChanges>(EMPTY_CHANGES);

    const hasSuggestedTags = () => Boolean(changes().suggestedTags?.trim());

    function updateField<K extends keyof ModerationPostChanges>(
        field: K,
        value: ModerationPostChanges[K],
    ) {
        setChanges((current) => ({ ...current, [field]: value }));
    }

    async function loadPost() {
        setLoading(true);
        setError(null);

        try {
            const loadedPost = await getPendingModerationPost();

            setPost(loadedPost);

            if (!loadedPost) {
                setTagsInput("");
                setChanges(EMPTY_CHANGES);
                return;
            }

            setTagsInput(loadedPost.tags.map((tag) => tag.name).join(", "));
            setChanges({
                title: loadedPost.title,
                description: loadedPost.description,
                rating: loadedPost.rating,
                tags: loadedPost.tags.map((tag) => tag.name),
                suggestedTags: loadedPost.suggestedTags,
                sourceUrl: loadedPost.sourceUrl,
            });
        } catch (err) {
            setError(errorKey(err, "errors.moderationLoadFailed"));
        } finally {
            setLoading(false);
        }
    }

    async function moderate(command: ModerationCommand) {
        const currentPost = post();

        if (!currentPost || actionLoading()) return;

        setActionLoading(true);
        setError(null);

        try {
            await moderatePost(
                currentPost.id,
                changes(),
                command,
            );

            setRejecting(false);
            setReason("");

            setPost(null);
            setTagsInput("");
            setChanges(EMPTY_CHANGES);

            await loadPost();
        } catch (err) {
            setError(errorKey(err, "errors.moderationActionFailed"));
        } finally {
            setActionLoading(false);
        }
    }

    function approve() {
        if (hasSuggestedTags()) {
            setError("errors.suggestedTags");
            return;
        }

        void moderate({ type: "APPROVE" });
    }

    function reject() {
        if (!reason().trim()) {
            setError("errors.rejectionReason");
            return;
        }

        void moderate({ type: "REJECT", reason: reason().trim() });
    }

    createEffect(() => {
        void loadPost();
    });

    return (
        <main class="page moderation-page">
            <div class="moderation-container">
                <header class="moderation-header">
                    <div>
                        <h1>{t("moderation.title")}</h1>
                        <p>
                            {t("moderation.subtitle")}
                        </p>
                    </div>

                    <div class="moderation-counter">
                        {plural("moderation.pendingPosts", post()?.count ?? 0)}
                    </div>

                    <LanguageSwitcher />
                </header>

                <Show when={error()}>
                    <div class="form-error">{t(error()!)}</div>
                </Show>

                <Show
                    when={!loading()}
                    fallback={
                        <div class="moderation-empty">
                            {t("moderation.loading")}
                        </div>
                    }
                >
                    <Show
                        when={post()}
                        fallback={
                            <section class="moderation-empty">
                                <div class="moderation-empty-icon">✓</div>

                                <h2>{t("moderation.emptyTitle")}</h2>

                                <p>
                                    {t("moderation.emptyDescription")}
                                </p>

                                <button
                                    class="btn btn-secondary"
                                    onClick={() => void loadPost()}
                                >
                                    {t("common.refresh")}
                                </button>
                            </section>
                        }
                    >
                        {(post) => (
                            <section class="moderation-card">
                                <div class="moderation-post">
                                    <img
                                        src={post().preview}
                                        alt={post().title ?? ""}
                                    />
                                </div>

                                <aside class="moderation-info">
                                    <dl class="moderation-details">
                                        <div>
                                            <dt>{t("moderation.uploader")}</dt>
                                            <dd>
                                                {post().uploadedBy?.username ??
                                                    t("common.unknown")}
                                            </dd>
                                        </div>
                                        <div>
                                            <dt>{t("moderation.status")}</dt>
                                            <dd>{t(`statuses.${post().status}`)}</dd>
                                        </div>
                                        <div>
                                            <dt>{t("moderation.uploadedAt")}</dt>
                                            <dd>
                                                {formatDate(post().createdAt)}
                                            </dd>
                                        </div>
                                        <div>
                                            <dt>{t("moderation.moderatedAt")}</dt>
                                            <dd>
                                                {formatDate(post().moderatedAt)}
                                            </dd>
                                        </div>
                                        <Show when={post().deletedAt}>
                                            <div>
                                                <dt>{t("moderation.deletedAt")}</dt>
                                                <dd>
                                                    {formatDate(
                                                        post().deletedAt,
                                                    )}
                                                </dd>
                                            </div>
                                        </Show>
                                        <div>
                                            <dt>{t("moderation.file")}</dt>
                                            <dd>{post().originalFilename}</dd>
                                        </div>
                                        <div>
                                            <dt>{t("moderation.typeAndSize")}</dt>
                                            <dd>
                                                {post().mimeType} ·{" "}
                                                {formatFileSize(post().size)}
                                            </dd>
                                        </div>
                                        <div>
                                            <dt>{t("moderation.statistics")}</dt>
                                            <dd>
                                                {plural(
                                                    "moderation.views",
                                                    post().views,
                                                )}{" "}
                                                ·{" "}
                                                {plural(
                                                    "moderation.favorites",
                                                    post().favorites,
                                                )}
                                            </dd>
                                        </div>
                                        <div class="moderation-detail-id">
                                            <dt>{t("moderation.id")}</dt>
                                            <dd>{post().id}</dd>
                                        </div>
                                    </dl>

                                    <div class="moderation-fields">
                                        <label>
                                            <span>{t("moderation.titleField")}</span>
                                            <input
                                                class="input"
                                                maxlength={120}
                                                value={changes().title ?? ""}
                                                onInput={(event) =>
                                                    updateField(
                                                        "title",
                                                        event.currentTarget
                                                            .value || null,
                                                    )
                                                }
                                            />
                                        </label>

                                        <label>
                                            <span>{t("moderation.description")}</span>
                                            <textarea
                                                class="input textarea"
                                                maxlength={1000}
                                                value={
                                                    changes().description ?? ""
                                                }
                                                onInput={(event) =>
                                                    updateField(
                                                        "description",
                                                        event.currentTarget
                                                            .value || null,
                                                    )
                                                }
                                            />
                                        </label>

                                        <label>
                                            <span>{t("moderation.rating")}</span>
                                            <select
                                                class="input rating-select"
                                                classList={{
                                                    "rating-safe":
                                                        changes().rating ===
                                                        "SAFE",
                                                    "rating-questionable":
                                                        changes().rating ===
                                                        "QUESTIONABLE",
                                                    "rating-explicit":
                                                        changes().rating ===
                                                        "EXPLICIT",
                                                }}
                                                value={changes().rating}
                                                onChange={(event) =>
                                                    updateField(
                                                        "rating",
                                                        event.currentTarget
                                                            .value as ModerationPostChanges["rating"],
                                                    )
                                                }
                                            >
                                                <option value="SAFE">
                                                    {t("ratings.SAFE")}
                                                </option>
                                                <option value="QUESTIONABLE">
                                                    {t("ratings.QUESTIONABLE")}
                                                </option>
                                                <option value="EXPLICIT">
                                                    {t("ratings.EXPLICIT")}
                                                </option>
                                            </select>
                                        </label>

                                        <label>
                                            <span>{t("moderation.tags")}</span>
                                            <input
                                                class="input"
                                                value={tagsInput()}
                                                onInput={(event) => {
                                                    setTagsInput(
                                                        event.currentTarget
                                                            .value,
                                                    );
                                                    updateField(
                                                        "tags",
                                                        event.currentTarget.value
                                                            .split(",")
                                                            .map((tag) =>
                                                                tag.trim(),
                                                            )
                                                            .filter(Boolean),
                                                    );
                                                }}
                                                placeholder={t("common.tagsPlaceholder")}
                                            />
                                            <small class="input-hint">
                                                {t("common.tagsHint")}
                                            </small>
                                        </label>

                                        <label>
                                            <span>{t("moderation.suggestedTags")}</span>
                                            <input
                                                class="input"
                                                value={
                                                    changes().suggestedTags ?? ""
                                                }
                                                onInput={(event) =>
                                                    updateField(
                                                        "suggestedTags",
                                                        event.currentTarget
                                                            .value || null,
                                                    )
                                                }
                                            />
                                            <Show when={hasSuggestedTags()}>
                                                <small class="input-hint form-error">
                                                    {t("moderation.suggestedTagsHint")}
                                                </small>
                                            </Show>
                                        </label>

                                        <label>
                                            <span>{t("moderation.source")}</span>
                                            <input
                                                class="input"
                                                type="url"
                                                maxlength={200}
                                                value={
                                                    changes().sourceUrl ?? ""
                                                }
                                                onInput={(event) =>
                                                    updateField(
                                                        "sourceUrl",
                                                        event.currentTarget
                                                            .value || null,
                                                    )
                                                }
                                            />
                                        </label>
                                    </div>

                                    <Show
                                        when={!rejecting()}
                                        fallback={
                                            <div class="reject-form">
                                                <label>
                                                    <span>
                                                        {t("moderation.rejectionReason")}
                                                    </span>

                                                    <textarea
                                                        class="input textarea"
                                                        value={reason()}
                                                        onInput={(event) =>
                                                            setReason(
                                                                event
                                                                    .currentTarget
                                                                    .value,
                                                            )
                                                        }
                                                        placeholder={t(
                                                            "moderation.rejectionReasonPlaceholder",
                                                        )}
                                                        maxlength={1000}
                                                    />
                                                </label>

                                                <div class="moderation-actions">
                                                    <button
                                                        class="btn"
                                                        disabled={
                                                            actionLoading()
                                                        }
                                                        onClick={reject}
                                                    >
                                                        {actionLoading()
                                                            ? t("moderation.rejecting")
                                                            : t("moderation.reject")}
                                                    </button>

                                                    <button
                                                        class="btn btn-secondary"
                                                        disabled={
                                                            actionLoading()
                                                        }
                                                        onClick={() => {
                                                            setRejecting(
                                                                false,
                                                            );
                                                            setReason("");
                                                        }}
                                                    >
                                                        {t("common.cancel")}
                                                    </button>
                                                </div>
                                            </div>
                                        }
                                    >
                                        <div class="moderation-actions">
                                            <button
                                                class="btn btn-danger"
                                                disabled={actionLoading()}
                                                onClick={() =>
                                                    setRejecting(true)
                                                }
                                            >
                                                {t("moderation.reject")}
                                            </button>

                                            <button
                                                class="btn btn-approve"
                                                disabled={
                                                    actionLoading() ||
                                                    hasSuggestedTags()
                                                }
                                                onClick={approve}
                                            >
                                                {actionLoading()
                                                    ? "..."
                                                    : t("moderation.approve")}
                                            </button>
                                        </div>
                                    </Show>

                                </aside>
                            </section>
                        )}
                    </Show>
                </Show>
            </div>
        </main>
    );
}
