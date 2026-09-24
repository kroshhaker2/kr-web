import { createEffect, createSignal, For, Show } from "solid-js";

type ModerationImage = {
    id: string;
    title: string;
    description: string | null;
    storageKey: string;
    mimeType: string;
    size: number;
    createdAt: string;

    user: {
        id: string;
        username: string;
    };

    tags: {
        id: string;
        name: string;
    }[];
};

export default function Moderation() {
    const [images, setImages] = createSignal<ModerationImage[]>([]);
    const [currentIndex, setCurrentIndex] = createSignal(0);

    const [loading, setLoading] = createSignal(true);
    const [actionLoading, setActionLoading] = createSignal(false);
    const [error, setError] = createSignal<string | null>(null);

    const [rejecting, setRejecting] = createSignal(false);
    const [reason, setReason] = createSignal("");

    const currentImage = () => images()[currentIndex()];

    async function loadImages() {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch(
                "/api/v1/mod/images?status=PENDING",
                {
                    credentials: "include",
                },
            );

            if (!response.ok) {
                throw new Error("Не удалось загрузить очередь.");
            }

            const data = await response.json();

            setImages(data);
            setCurrentIndex(0);
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

    async function moderate(
        action: "approve" | "reject",
        rejectReason?: string,
    ) {
        const image = currentImage();

        if (!image || actionLoading()) return;

        setActionLoading(true);
        setError(null);

        try {
            const response = await fetch(
                `/api/v1/mod/images/${image.id}/${action}`,
                {
                    method: "POST",
                    credentials: "include",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body:
                        action === "reject"
                            ? JSON.stringify({
                                  reason: rejectReason?.trim() || null,
                              })
                            : undefined,
                },
            );

            if (!response.ok) {
                const body = await response.json().catch(() => null);

                throw new Error(
                    body?.message ?? "Не удалось выполнить действие.",
                );
            }

            setRejecting(false);
            setReason("");

            setImages((current) =>
                current.filter((item) => item.id !== image.id),
            );

            if (currentIndex() >= images().length - 1) {
                setCurrentIndex(Math.max(0, images().length - 2));
            }
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
        void moderate("approve");
    }

    function reject() {
        if (!reason().trim()) {
            setError("Укажите причину отклонения.");
            return;
        }

        void moderate("reject", reason());
    }

    function next() {
        if (currentIndex() < images().length - 1) {
            setCurrentIndex((index) => index + 1);
        }
    }

    function previous() {
        if (currentIndex() > 0) {
            setCurrentIndex((index) => index - 1);
        }
    }

    function formatSize(bytes: number) {
        if (bytes < 1024 * 1024) {
            return `${Math.round(bytes / 1024)} КБ`;
        }

        return `${(bytes / 1024 / 1024).toFixed(1)} МБ`;
    }

    createEffect(() => {
        void loadImages();
    });

    return (
        <main class="page moderation-page">
            <div class="moderation-container">
                <header class="moderation-header">
                    <div>
                        <h1>Модерация</h1>
                        <p>
                            Изображения, ожидающие проверки.
                        </p>
                    </div>

                    <div class="moderation-counter">
                        {images().length} ожидает проверки
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
                        when={currentImage()}
                        fallback={
                            <section class="moderation-empty">
                                <div class="moderation-empty-icon">✓</div>

                                <h2>Очередь пуста</h2>

                                <p>
                                    Все изображения проверены.
                                </p>

                                <button
                                    class="btn btn-secondary"
                                    onClick={() => void loadImages()}
                                >
                                    Обновить
                                </button>
                            </section>
                        }
                    >
                        {(image) => (
                            <section class="moderation-card">
                                <div class="moderation-image">
                                    <img
                                        src={`/api/v1/images/${image().id}/file`}
                                        alt={image().title}
                                    />
                                </div>

                                <aside class="moderation-info">
                                    <div class="moderation-position">
                                        {currentIndex() + 1} / {images().length}
                                    </div>

                                    <h2>{image().title}</h2>

                                    <div class="moderation-author">
                                        Автор:
                                        <strong>
                                            {image().user.username}
                                        </strong>
                                    </div>

                                    <Show when={image().description}>
                                        <p class="moderation-description">
                                            {image().description}
                                        </p>
                                    </Show>

                                    <div class="moderation-meta">
                                        <span>
                                            {image().mimeType}
                                        </span>

                                        <span>
                                            {formatSize(image().size)}
                                        </span>
                                    </div>

                                    <Show when={image().tags.length}>
                                        <div class="moderation-tags">
                                            <For each={image().tags}>
                                                {(tag) => (
                                                    <span class="tag">
                                                        #{tag.name}
                                                    </span>
                                                )}
                                            </For>
                                        </div>
                                    </Show>

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
                                                        maxlength={500}
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
                                                disabled={
                                                    actionLoading()
                                                }
                                                onClick={() =>
                                                    setRejecting(true)
                                                }
                                            >
                                                Отклонить
                                            </button>

                                            <button
                                                class="btn btn-approve"
                                                disabled={
                                                    actionLoading()
                                                }
                                                onClick={approve}
                                            >
                                                {actionLoading()
                                                    ? "..."
                                                    : "Одобрить"}
                                            </button>
                                        </div>
                                    </Show>

                                    <div class="moderation-navigation">
                                        <button
                                            class="btn btn-secondary"
                                            disabled={
                                                currentIndex() === 0 ||
                                                actionLoading()
                                            }
                                            onClick={previous}
                                        >
                                            ←
                                        </button>

                                        <button
                                            class="btn btn-secondary"
                                            disabled={
                                                currentIndex() >=
                                                    images().length - 1 ||
                                                actionLoading()
                                            }
                                            onClick={next}
                                        >
                                            →
                                        </button>
                                    </div>
                                </aside>
                            </section>
                        )}
                    </Show>
                </Show>
            </div>
        </main>
    );
}