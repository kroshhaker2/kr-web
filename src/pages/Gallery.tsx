import { createSignal, onMount, Show } from "solid-js";

import TopBar from "@/components/TopBar";
import Pins from "@/components/Pins";
import { getPosts } from "@/api/posts";
import type { Post } from "@/types/post";
import { useI18n, type TranslationKey } from "@/i18n/context";

export default function Gallery() {
    const { t } = useI18n();
    const [posts, setPosts] = createSignal<Post[]>([]);
    const [page, setPage] = createSignal(1);
    const [totalPages, setTotalPages] = createSignal(1);
    const [loading, setLoading] = createSignal(false);
    const [error, setError] = createSignal<TranslationKey | null>(null);

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

            setError("gallery.loadError");
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
                user={null}
            />

            <Show when={loading()}>
                <div class="status">{t("common.loading")}</div>
            </Show>

            <Show when={error()}>
                {(message) => <div class="status error">{t(message())}</div>}
            </Show>

            <Show
                when={!loading() && !error() && posts().length > 0}
                fallback={
                    <Show when={!loading() && !error()}>
                        <div class="status">{t("gallery.empty")}</div>
                    </Show>
                }
            >
                <Pins posts={posts()} />
            </Show>
        </>
    );
}
