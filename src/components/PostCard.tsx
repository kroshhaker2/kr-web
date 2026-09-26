import { createSignal, Show } from "solid-js";
import type { Post } from "../types/post";
import { setLike } from "../api/posts";
import { useI18n } from "@/i18n/context";

interface Props {
    post: Post;
    selected?: boolean;
    onClick?: (post: Post) => void;
}

export default function PostCard(props: Props) {
    const { t } = useI18n();
    const [liked, setLiked] = createSignal(props.post.liked);
    const [loading, setLoading] = createSignal(true);
    const [saving, setSaving] = createSignal(false);

    async function toggleLike(event: MouseEvent) {
        event.preventDefault();
        event.stopPropagation();

        if (saving()) return;

        const next = !liked();

        setLiked(next);
        setSaving(true);

        try {
            await setLike(props.post.id, next);
        } catch (error) {
            console.error("Could not save like:", error);
            setLiked(!next);
        } finally {
            setSaving(false);
        }
    }

    function handleLikeClick(event: MouseEvent): void {
        void toggleLike(event);
    }

    function handleClick(event: MouseEvent) {
        if (props.onClick) {
            event.preventDefault();
            props.onClick(props.post);
        }
    }

    return (
        <div
            class="post"
            classList={{
                "is-loading": loading(),
                "is-animated": props.post.tags?.includes("animated"),
                selected: props.selected,
            }}
        >
            <Show when={!props.onClick}>
                <button
                    type="button"
                    class="like-btn"
                    classList={{
                        "is-liked": liked(),
                    }}
                    disabled={saving()}
                    aria-label={t("gallery.like")}
                    onClick={handleLikeClick}
                >
                    ♥
                </button>
            </Show>

            <a
                href={props.post.file}
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleClick}
            >
                <img
                    class="img"
                    classList={{
                        loaded: !loading(),
                    }}
                    src={props.post.preview}
                    alt={props.post.id}
                    loading="lazy"
                    onLoad={() => setLoading(false)}
                    onError={() => setLoading(false)}
                />
            </a>
        </div>
    );
}
