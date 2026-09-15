import { createSignal, onMount, Show } from "solid-js";

import TopBar from "@/components/TopBar";
import Pins from "@/components/Pins";
import { getPosts } from "@/api/posts";
import type { Post } from "@/types/post";
import { loadUser } from "@/stores/auth";

const THEMES = ["amber", "oled", "light", "dark", "cappuccino"];

export default function Gallery() {
    const [posts, setPosts] = createSignal<Post[]>([]);
    const [page, setPage] = createSignal(1);
    const [totalPages, setTotalPages] = createSignal(1);
    const [loading, setLoading] = createSignal(false);
    const [error, setError] = createSignal<string | null>(null);

    const [theme, setTheme] = createSignal(
        localStorage.getItem("gallery-theme") || "oled",
    );

    function applyTheme(name: string): void {
        document.documentElement.setAttribute("data-theme", name);
        localStorage.setItem("gallery-theme", name);
        setTheme(name);
    }

    function cycleTheme() {
        const current = theme();
        const index = THEMES.indexOf(current);
        const next = THEMES[(index + 1) % THEMES.length];

        applyTheme(next);
    }

    async function loadPosts(targetPage = page()) {
        setLoading(true);
        setError(null);

        try {
            const data = await getPosts(targetPage);

            setPosts(data.content);
            setTotalPages(data.pages || 1);
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

    function next(): void {
        if (page() < totalPages()) {
            void loadPosts(page() + 1);
        }
    }

    function prev(): void {
        if (page() > 1) {
            void loadPosts(page() - 1);
        }
    }

    onMount(() => {
        applyTheme(theme());
        void loadUser();
        void loadPosts();
    });

    return (
        <>
            <TopBar
                page={page()}
                totalPages={totalPages()}
                loading={loading()}
                onPrev={prev}
                onNext={next}
                onPage={(targetPage) => void loadPosts(targetPage)}
                onTheme={cycleTheme}
                user={null}
            />

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
                        <div class="status">На этой странице ничего нет.</div>
                    </Show>
                }
            >
                <Pins posts={posts()} />
            </Show>
        </>
    );
}
