import { createEffect, createSignal, Show } from "solid-js";
import { getPendingModerationPost, moderatePost } from "@/api/admin";
import type {
    ModerationCommand,
    ModerationPost,
    ModerationPostChanges,
} from "@/types/admin";

const EMPTY_CHANGES: ModerationPostChanges = {
    title: null,
    description: null,
    rating: "SAFE",
    tags: [],
    suggestedTags: null,
    sourceUrl: null,
};

export default function Moderation() {
    const [post, setPost] = createSignal<ModerationPost | null>(null);

    const [loading, setLoading] = createSignal(true);
    const [actionLoading, setActionLoading] = createSignal(false);
    const [error, setError] = createSignal<string | null>(null);

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
            setError(
                err instanceof Error
                    ? err.message
                    : "Не удалось загрузить очередь.",
            );
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
            setError(
                err instanceof Error
                    ? err.message
                    : "Не удалось выполнить действие.",
            );
        } finally {
            setActionLoading(false);
        }
    }

    function approve() {
        if (hasSuggestedTags()) {
            setError("Обработайте предложенные теги перед одобрением.");
            return;
        }

        void moderate({ type: "APPROVE" });
    }

    function reject() {
        if (!reason().trim()) {
            setError("Укажите причину отклонения.");
            return;
        }

        void moderate({ type: "REJECT", reason: reason().trim() });
    }

    function formatSize(bytes: number) {
        if (bytes < 1024 * 1024) {
            return `${Math.round(bytes / 1024)} КБ`;
        }

        return `${(bytes / 1024 / 1024).toFixed(1)} МБ`;
    }

    function formatDate(value: string | null) {
        if (!value) return "—";

        const date = new Date(value);

        if (Number.isNaN(date.getTime())) return value;

        return new Intl.DateTimeFormat("ru-RU", {
            dateStyle: "medium",
            timeStyle: "short",
        }).format(date);
    }

    createEffect(() => {
        void loadPost();
    });

    return (
        <main class="page moderation-page">
            <div class="moderation-container">
                <header class="moderation-header">
                    <div>
                        <h1>Модерация</h1>
                        <p>
                            Посты, ожидающие проверки.
                        </p>
                    </div>

                    <div class="moderation-counter">
                        {post()?.count ?? 0} ожидает проверки
                    </div>
                </header>

                <Show when={error()}>
                    <div class="form-error">{error()}</div>
                </Show>

                <Show
                    when={!loading()}
                    fallback={
                        <div class="moderation-empty">
                            Загрузка очереди...
                        </div>
                    }
                >
                    <Show
                        when={post()}
                        fallback={
                            <section class="moderation-empty">
                                <div class="moderation-empty-icon">✓</div>

                                <h2>Очередь пуста</h2>

                                <p>
                                    Все посты проверены.
                                </p>

                                <button
                                    class="btn btn-secondary"
                                    onClick={() => void loadPost()}
                                >
                                    Обновить
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
                                            <dt>Автор</dt>
                                            <dd>
                                                {post().uploadedBy?.username ??
                                                    "Неизвестен"}
                                            </dd>
                                        </div>
                                        <div>
                                            <dt>Статус</dt>
                                            <dd>{post().status}</dd>
                                        </div>
                                        <div>
                                            <dt>Загружен</dt>
                                            <dd>
                                                {formatDate(post().createdAt)}
                                            </dd>
                                        </div>
                                        <div>
                                            <dt>Проверен</dt>
                                            <dd>
                                                {formatDate(post().moderatedAt)}
                                            </dd>
                                        </div>
                                        <Show when={post().deletedAt}>
                                            <div>
                                                <dt>Удалён</dt>
                                                <dd>
                                                    {formatDate(
                                                        post().deletedAt,
                                                    )}
                                                </dd>
                                            </div>
                                        </Show>
                                        <div>
                                            <dt>Файл</dt>
                                            <dd>{post().originalFilename}</dd>
                                        </div>
                                        <div>
                                            <dt>Тип и размер</dt>
                                            <dd>
                                                {post().mimeType} ·{" "}
                                                {formatSize(post().size)}
                                            </dd>
                                        </div>
                                        <div>
                                            <dt>Статистика</dt>
                                            <dd>
                                                {post().views} просмотров ·{" "}
                                                {post().favorites} в избранном
                                            </dd>
                                        </div>
                                        <div class="moderation-detail-id">
                                            <dt>ID</dt>
                                            <dd>{post().id}</dd>
                                        </div>
                                    </dl>

                                    <div class="moderation-fields">
                                        <label>
                                            <span>Название</span>
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
                                            <span>Описание</span>
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
                                            <span>Рейтинг</span>
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
                                                <option value="SAFE">SAFE</option>
                                                <option value="QUESTIONABLE">
                                                    QUESTIONABLE
                                                </option>
                                                <option value="EXPLICIT">
                                                    EXPLICIT
                                                </option>
                                            </select>
                                        </label>

                                        <label>
                                            <span>Теги</span>
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
                                                placeholder="nature, city, night"
                                            />
                                            <small class="input-hint">
                                                Разделяйте теги запятыми.
                                            </small>
                                        </label>

                                        <label>
                                            <span>Предложенные теги</span>
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
                                                    Очистите поле перед одобрением.
                                                </small>
                                            </Show>
                                        </label>

                                        <label>
                                            <span>Источник</span>
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
                                                        Причина отклонения
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
                                                        placeholder="Укажите причину..."
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
                                                            ? "Отклонение..."
                                                            : "Отклонить"}
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
                                                        Отмена
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
                                                Отклонить
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
                                                    : "Одобрить"}
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
