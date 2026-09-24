import { createSignal, Show } from "solid-js";
import { useNavigate } from "@solidjs/router";
import { API } from "@/config";
import type { Rating } from "@/types/post";

export default function Upload() {
    const navigate = useNavigate();

    const [file, setFile] = createSignal<File | null>(null);
    const [preview, setPreview] = createSignal<string | null>(null);

    const [title, setTitle] = createSignal("");
    const [description, setDescription] = createSignal("");
    const [tags, setTags] = createSignal("");
    const [rating, setRating] = createSignal<Rating>("SAFE");

    const [dragging, setDragging] = createSignal(false);
    const [loading, setLoading] = createSignal(false);
    const [error, setError] = createSignal<string | null>(null);
    const [submitted, setSubmitted] = createSignal(false);

    const [metadata, setMetadata] = createSignal<{
        type: "Фото" | "Видео";
        format: string;
        width: number;
        height: number;
        duration?: number;
    } | null>(null);

    function selectFile(selected: File | undefined) {
        if (!selected) return;

        setError(null);

        if (
            !selected.type.startsWith("image/") &&
            !selected.type.startsWith("video/")
        ) {
            setError("Можно загружать только изображения и видео.");
            return;
        }

        if (selected.size > 20 * 1024 * 1024) {
            setError("Максимальный размер файла — 20 МБ.");
            return;
        }

        setFile(selected);

        const url = URL.createObjectURL(selected);
        setPreview(url);

        if (selected.type.startsWith("image/")) {
            const image = new Image();

            image.onload = () => {
                setMetadata({
                    type: "Фото",
                    format:
                        selected.type.split("/")[1]?.toUpperCase() ?? "UNKNOWN",
                    width: image.naturalWidth,
                    height: image.naturalHeight,
                });

                URL.revokeObjectURL(image.src);
            };

            image.src = url;
            return;
        }

        const video = document.createElement("video");

        video.onloadedmetadata = () => {
            setMetadata({
                type: "Видео",
                format: selected.type.split("/")[1]?.toUpperCase() ?? "UNKNOWN",
                width: video.videoWidth,
                height: video.videoHeight,
                duration: video.duration,
            });

            URL.revokeObjectURL(video.src);
        };

        video.src = url;
    }

    function onFileInput(event: Event) {
        const input = event.currentTarget as HTMLInputElement;
        selectFile(input.files?.[0]);
    }

    function onDrop(event: DragEvent) {
        event.preventDefault();
        setDragging(false);

        selectFile(event.dataTransfer?.files[0]);
    }

    function clearFile() {
        setFile(null);

        const currentPreview = preview();

        if (currentPreview) {
            URL.revokeObjectURL(currentPreview);
        }

        setPreview(null);
        setMetadata(null);
    }

    function formatFileSize(bytes: number): string {
        if (bytes < 1024 * 1024) {
            return `${(bytes / 1024).toFixed(0)} КБ`;
        }

        return `${(bytes / 1024 / 1024).toFixed(2)} МБ`;
    }

    function formatDuration(seconds: number): string {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60);

        return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
    }

    async function submit() {
        const currentFile = file();

        if (!currentFile) {
            setError("Выберите изображение.");
            return;
        }

        if (!title().trim()) {
            setError("Введите название изображения.");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const formData = new FormData();

            const parsedTags = tags()
                .split(",")
                .map((tag) => tag.trim())
                .filter(Boolean);

            formData.append("metadata", JSON.stringify({
                title: title().trim(),
                description: description().trim(),
                tags: parsedTags,
                rating: rating(),
            }));
            formData.append("file", currentFile);

            const response = await fetch(`${API}/posts`, {
                method: "POST",
                credentials: "include",
                body: formData,
            });

            if (!response.ok) {
                const body = await response.json().catch(() => null);

                throw new Error(
                    body?.message ?? "Не удалось отправить изображение.",
                );
            }

            setSubmitted(true);
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Не удалось отправить изображение.",
            );
        } finally {
            setLoading(false);
        }
    }

    return (
        <main class="page upload-page">
            <div class="upload-container">
                <Show
                    when={!submitted()}
                    fallback={
                        <section class="upload-success">
                            <div class="upload-success-icon">✓</div>

                            <h1>Изображение отправлено</h1>

                            <p>
                                Оно находится на модерации. После проверки
                                изображение появится в галерее.
                            </p>

                            <div class="upload-success-actions">
                                <button
                                    class="btn"
                                    onClick={() => navigate("/")}
                                >
                                    Вернуться в галерею
                                </button>

                                <button
                                    class="btn btn-secondary"
                                    onClick={() => {
                                        setSubmitted(false);
                                        clearFile();
                                        setTitle("");
                                        setDescription("");
                                        setTags("");
                                        setRating("SAFE");
                                    }}
                                >
                                    Загрузить ещё
                                </button>
                            </div>
                        </section>
                    }
                >
                    <section class="upload-header">
                        <div>
                            <h1>Загрузить изображение</h1>
                        </div>
                    </section>

                    <Show
                        when={!file()}
                        fallback={
                            <div class="upload-preview">
                                <img src={preview() ?? ""} alt="Предпросмотр" />

                                <div class="upload-preview-overlay">
                                    <button
                                        class="btn btn-secondary"
                                        onClick={clearFile}
                                    >
                                        Выбрать другое
                                    </button>
                                </div>
                            </div>
                        }
                    >
                        <label
                            class={`upload-dropzone ${
                                dragging() ? "is-dragging" : ""
                            }`}
                            onDragOver={(event) => {
                                event.preventDefault();
                                setDragging(true);
                            }}
                            onDragLeave={() => setDragging(false)}
                            onDrop={onDrop}
                        >
                            <input
                                type="file"
                                accept="image/*"
                                onChange={onFileInput}
                            />

                            <div class="upload-dropzone-icon">+</div>

                            <strong>Перетащите изображение сюда</strong>

                            <span>или нажмите для выбора файла</span>

                            <small>PNG, JPEG, WebP · до 20 МБ</small>
                        </label>
                    </Show>

                    <Show when={metadata()}>
                        {(info) => (
                            <div class="upload-metadata">
                                <div>
                                    <span>Тип</span>
                                    <strong>{info().type}</strong>
                                </div>

                                <div>
                                    <span>Формат</span>
                                    <strong>{info().format}</strong>
                                </div>

                                <div>
                                    <span>Разрешение</span>
                                    <strong>
                                        {info().width} × {info().height}
                                    </strong>
                                </div>

                                <Show when={info().duration !== undefined}>
                                    <div>
                                        <span>Длительность</span>
                                        <strong>
                                            {formatDuration(info().duration!)}
                                        </strong>
                                    </div>
                                </Show>

                                <div>
                                    <span>Размер</span>
                                    <strong>
                                        {formatFileSize(file()!.size)}
                                    </strong>
                                </div>
                            </div>
                        )}
                    </Show>

                    <div class="upload-form">
                        <label>
                            <span>Название</span>

                            <input
                                class="input"
                                type="text"
                                maxlength="120"
                                value={title()}
                                onInput={(event) =>
                                    setTitle(event.currentTarget.value)
                                }
                                placeholder="Название изображения"
                            />
                        </label>

                        <label>
                            <span>Описание</span>

                            <textarea
                                class="input textarea"
                                maxlength="1000"
                                value={description()}
                                onInput={(event) =>
                                    setDescription(event.currentTarget.value)
                                }
                                placeholder="Необязательно"
                            />
                        </label>

                        <label>
                            <span>Рейтинг</span>

                            <select
                                class="input"
                                value={rating()}
                                onChange={(event) =>
                                    setRating(event.currentTarget.value as Rating)
                                }
                            >
                                <option value="SAFE">Безопасный (SAFE)</option>
                                <option value="QUESTIONABLE">Сомнительный (QUESTIONABLE)</option>
                                <option value="EXPLICIT">Откровенный (EXPLICIT)</option>
                            </select>
                        </label>

                        <label>
                            <span>Теги</span>

                            <input
                                class="input"
                                type="text"
                                value={tags()}
                                onInput={(event) =>
                                    setTags(event.currentTarget.value)
                                }
                                placeholder="nature, city, night"
                            />

                            <small class="input-hint">
                                Разделяйте теги запятыми.
                            </small>
                        </label>

                        <Show when={error()}>
                            <div class="form-error">{error()}</div>
                        </Show>

                        <button
                            class="btn upload-submit"
                            disabled={loading() || !file()}
                            onClick={submit}
                        >
                            {loading()
                                ? "Отправка..."
                                : "Отправить на модерацию"}
                        </button>
                    </div>
                </Show>
            </div>
        </main>
    );
}
