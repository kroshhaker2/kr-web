import { For } from "solid-js";
import type { Post } from "../types/post";
import PostCard from "./PostCard";

interface Props {
    posts: Post[];
    selected?: Set<string>;
    onSelect?: (post: Post) => void;
}

export default function Pins(props: Props) {
    const columnCount = () => {
        const width = window.innerWidth;
        return Math.max(1, Math.floor(width / 260));
    };

    const columns = () => {
        const result: Post[][] = Array.from(
            { length: columnCount() },
            () => [],
        );

        props.posts.forEach((post, index) => {
            result[index % result.length].push(post);
        });

        return result;
    };

    return (
        <div class="pictures">
            <For each={columns()}>
                {(column) => (
                    <div class="column">
                        <For each={column}>
                            {(post) => (
                                <PostCard
                                    post={post}
                                    selected={
                                        props.selected?.has(post.id) ?? false
                                    }
                                    onClick={props.onSelect}
                                />
                            )}
                        </For>
                    </div>
                )}
            </For>
        </div>
    );
}
