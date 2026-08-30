import { createSignal, Show } from "solid-js";
import type { Post } from "../types/post";
import { setLike } from "../api/posts";

interface Props {
    post: Post;
    selected?: boolean;
    onClick?: (post: Post) => void;
}

export default function PostCard(props: Props) {
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
            console.error("Не удалось сохранить лайк:", error);
            setLiked(!next);
        } finally {
            setSaving(false);
        }
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
                    aria-label="Лайк"
                    onClick={toggleLike}
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
