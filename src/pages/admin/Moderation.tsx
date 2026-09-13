import { createSignal, onCleanup, onMount, Show } from "solid-js";

import Pins from "@/components/Pins";
import { getPosts, updatePost } from "@/api/posts";
import type { Post } from "@/types/post";
import ModSidebar from "@/components/admin/ModSidebar";
import { deletePost } from "@/api/posts";

export default function Moderation() {
    const [posts, setPosts] = createSignal<Post[]>([]);
    const [page, setPage] = createSignal(1);
    const [loading, setLoading] = createSignal(false);
    const [selected, setSelected] = createSignal<Set<string>>(new Set());
    const [error, setError] = createSignal<string | null>(null);
    const [filterQuery, setFilterQuery] = createSignal("");
    const [filterDebounce, setFilterDebounce] = createSignal<
        ReturnType<typeof setTimeout> | undefined
    >();

    const [theme, setTheme] = createSignal(
        localStorage.getItem("gallery-theme") || "oled",
    );

    function applyTheme(name: string) {
        document.documentElement.setAttribute("data-theme", name);
        localStorage.setItem("gallery-theme", name);
        setTheme(name);
    }

    function handleFilterChange(query: string): void {
        setFilterQuery(query);

        const current = filterDebounce();

        if (current) {
            clearTimeout(current);
        }

        setFilterDebounce(
            setTimeout(() => {
                void loadPosts(1);
            }, 300),
        );
    }

    onCleanup(() => {
        const current = filterDebounce();

        if (current) {
            clearTimeout(current);
        }
    });

    async function loadPosts(targetPage = page()) {
        setLoading(true);
        setError(null);

        try {
            const data = await getPosts(targetPage, 10000, filterQuery());

            setPosts(data.content);
            setPage(targetPage);
        } catch (err) {
            console.error(err);
            setError(
                "Не удалось загрузить картинки. Проверь, запущен ли сервер.",
            );
        } finally {
            setLoading(false);
        }
    }

    function selectPost(post: Post) {
        setSelected((current) => {
            const next = new Set(current);

            if (next.has(post.id)) {
                next.delete(post.id);
            } else {
                next.add(post.id);
            }

            return next;
        });
    }

    async function addTagToSelected(tag: string) {
        const ids = Array.from(selected());
        let failed = 0;

        await Promise.all(
            ids.map(async (id) => {
                const post = posts().find((p) => p.id === id);
                if (!post) return;
                const nextTags = Array.from(
                    new Set([...(post.tags ?? []), tag]),
                );

                try {
                    await updatePost(id, { tags: nextTags });
                    setPosts((current) =>
                        current.map((p) =>
                            p.id === id ? { ...p, tags: nextTags } : p,
                        ),
                    );
                } catch (err) {
                    console.error(`Не удалось обновить теги для ${id}:`, err);
                    failed++;
                }
            }),
        );

        if (failed > 0)
            setError(`Не удалось обновить ${failed} из ${ids.length} постов.`);
    }

    async function removeTagFromSelected(tag: string) {
        const ids = Array.from(selected());
        let failed = 0;

        await Promise.all(
            ids.map(async (id) => {
                const post = posts().find((p) => p.id === id);
                if (!post) return;
                const nextTags = (post.tags ?? []).filter((t) => t !== tag);

                try {
                    await updatePost(id, { tags: nextTags });
                    setPosts((current) =>
                        current.map((p) =>
                            p.id === id ? { ...p, tags: nextTags } : p,
                        ),
                    );
                } catch (err) {
                    console.error(`Не удалось обновить теги для ${id}:`, err);
                    failed++;
                }
            }),
        );

        if (failed > 0)
            setError(`Не удалось обновить ${failed} из ${ids.length} постов.`);
    }

    async function deleteSelectedPosts() {
        const ids = Array.from(selected());
        const deletedIds = new Set<string>();

        await Promise.all(
            ids.map(async (id) => {
                try {
                    await deletePost(id);
                    deletedIds.add(id);
                } catch (err) {
                    console.error(`Не удалось удалить ${id}:`, err);
                }
            }),
        );

        setPosts((current) => current.filter((p) => !deletedIds.has(p.id)));
        setSelected((current) => {
            const next = new Set(current);
            deletedIds.forEach((id) => next.delete(id));
            return next;
        });

        if (deletedIds.size < ids.length) {
            setError(`Удалено ${deletedIds.size} из ${ids.length}.`);
        }
    }

    onMount(() => {
        applyTheme(theme());
        void loadPosts();
    });

    return (
        <div class="moderation-layout">
            <ModSidebar
                selectedCount={selected().size}
                onAddTag={(tag) => void addTagToSelected(tag)}
                onRemoveTag={(tag) => void removeTagFromSelected(tag)}
                onDeleteSelected={() => void deleteSelectedPosts()}
                onFilterChange={handleFilterChange}
            />

            <main class="moderation-content">
                <Show when={loading()}>
                    <div class="status">Загрузка…</div>
                </Show>

                <Show when={error()}>
                    {(message) => <div class="status error">{message()}</div>}
                </Show>

                <Show
                    when={!loading() && !error() && posts().length > 0}
                    fallback={
                        <Show when={!loading() && !error()}>
                            <div class="status">
                                На этой странице ничего нет.
                            </div>
                        </Show>
                    }
                >
                    <Pins
                        posts={posts()}
                        selected={selected()}
                        onSelect={selectPost}
                    />
                </Show>
            </main>
        </div>
    );
}
