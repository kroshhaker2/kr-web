import { createSignal, Show } from "solid-js";
import { useNavigate } from "@solidjs/router";
import { createPost } from "@/api/posts";
import type { Rating } from "@/types/post";
import { useI18n, type TranslationKey } from "@/i18n/context";
import LanguageSwitcher from "@/components/LanguageSwitcher";

export default function Upload() {
    const navigate = useNavigate();
    const { t, formatFileSize, errorKey } = useI18n();

    const [file, setFile] = createSignal<File | null>(null);
    const [preview, setPreview] = createSignal<string | null>(null);

    const [title, setTitle] = createSignal("");
    const [description, setDescription] = createSignal("");
    const [tags, setTags] = createSignal("");
    const [rating, setRating] = createSignal<Rating>("SAFE");

    const [dragging, setDragging] = createSignal(false);
    const [loading, setLoading] = createSignal(false);
    const [error, setError] = createSignal<TranslationKey | null>(null);
    const [submitted, setSubmitted] = createSignal(false);

    const [metadata, setMetadata] = createSignal<{
        type: "image" | "video";
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
            setError("errors.uploadType");
            return;
        }

        if (selected.size > 20 * 1024 * 1024) {
            setError("errors.uploadSize");
            return;
        }

        setFile(selected);

        const url = URL.createObjectURL(selected);
        setPreview(url);

        if (selected.type.startsWith("image/")) {
            const image = new Image();

            image.onload = () => {
                setMetadata({
                    type: "image",
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
                type: "video",
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

    function formatDuration(seconds: number): string {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60);

        return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
    }

    async function submit() {
        const currentFile = file();

        if (!currentFile) {
            setError("errors.fileRequired");
            return;
        }

        if (!title().trim()) {
            setError("errors.titleRequired");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const parsedTags = tags()
                .split(",")
                .map((tag) => tag.trim())
                .filter(Boolean);

            await createPost({
                file: currentFile,
                title: title().trim(),
                description: description().trim(),
                tags: parsedTags,
                rating: rating(),
            });

            setSubmitted(true);
        } catch (err) {
            setError(errorKey(err, "errors.uploadFailed"));
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

                            <h1>{t("upload.successTitle")}</h1>

                            <p>
                                {t("upload.successDescription")}
                            </p>

                            <div class="upload-success-actions">
                                <button
                                    class="btn"
                                    onClick={() => navigate("/")}
                                >
                                    {t("upload.backToGallery")}
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
                                    {t("upload.uploadAnother")}
                                </button>
                            </div>
                        </section>
                    }
                >
                    <section class="upload-header">
                        <div>
                            <h1>{t("upload.title")}</h1>
                        </div>
                        <LanguageSwitcher />
                    </section>

                    <Show
                        when={!file()}
                        fallback={
                            <div class="upload-preview">
                                <img
                                    src={preview() ?? ""}
                                    alt={t("upload.previewAlt")}
                                />

                                <div class="upload-preview-overlay">
                                    <button
                                        class="btn btn-secondary"
                                        onClick={clearFile}
                                    >
                                        {t("upload.chooseAnother")}
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
                                accept="image/*,video/*"
                                onChange={onFileInput}
                            />

                            <div class="upload-dropzone-icon">+</div>

                            <strong>{t("upload.drop")}</strong>

                            <span>{t("upload.choose")}</span>

                            <small>{t("upload.requirements")}</small>
                        </label>
                    </Show>

                    <Show when={metadata()}>
                        {(info) => (
                            <div class="upload-metadata">
                                <div>
                                    <span>{t("upload.type")}</span>
                                    <strong>
                                        {t(
                                            info().type === "image"
                                                ? "upload.image"
                                                : "upload.video",
                                        )}
                                    </strong>
                                </div>

                                <div>
                                    <span>{t("upload.format")}</span>
                                    <strong>{info().format}</strong>
                                </div>

                                <div>
                                    <span>{t("upload.resolution")}</span>
                                    <strong>
                                        {info().width} × {info().height}
                                    </strong>
                                </div>

                                <Show when={info().duration !== undefined}>
                                    <div>
                                        <span>{t("upload.duration")}</span>
                                        <strong>
                                            {formatDuration(info().duration!)}
                                        </strong>
                                    </div>
                                </Show>

                                <div>
                                    <span>{t("upload.size")}</span>
                                    <strong>
                                        {formatFileSize(file()!.size)}
                                    </strong>
                                </div>
                            </div>
                        )}
                    </Show>

                    <div class="upload-form">
                        <label>
                            <span>{t("upload.name")}</span>

                            <input
                                class="input"
                                type="text"
                                maxlength="120"
                                value={title()}
                                onInput={(event) =>
                                    setTitle(event.currentTarget.value)
                                }
                                placeholder={t("upload.namePlaceholder")}
                            />
                        </label>

                        <label>
                            <span>{t("upload.description")}</span>

                            <textarea
                                class="input textarea"
                                maxlength="1000"
                                value={description()}
                                onInput={(event) =>
                                    setDescription(event.currentTarget.value)
                                }
                                placeholder={t("common.optional")}
                            />
                        </label>

                        <label>
                            <span>{t("upload.rating")}</span>

                            <select
                                class="input"
                                value={rating()}
                                onChange={(event) =>
                                    setRating(event.currentTarget.value as Rating)
                                }
                            >
                                <option value="SAFE">{t("ratings.SAFE")}</option>
                                <option value="QUESTIONABLE">
                                    {t("ratings.QUESTIONABLE")}
                                </option>
                                <option value="EXPLICIT">
                                    {t("ratings.EXPLICIT")}
                                </option>
                            </select>
                        </label>

                        <label>
                            <span>{t("upload.tags")}</span>

                            <input
                                class="input"
                                type="text"
                                value={tags()}
                                onInput={(event) =>
                                    setTags(event.currentTarget.value)
                                }
                                placeholder={t("common.tagsPlaceholder")}
                            />

                            <small class="input-hint">
                                {t("common.tagsHint")}
                            </small>
                        </label>

                        <Show when={error()}>
                            <div class="form-error">{t(error()!)}</div>
                        </Show>

                        <button
                            class="btn upload-submit"
                            disabled={loading() || !file()}
                            onClick={() => void submit()}
                        >
                            {loading()
                                ? t("upload.submitting")
                                : t("upload.submit")}
                        </button>
                    </div>
                </Show>
            </div>
        </main>
    );
}
