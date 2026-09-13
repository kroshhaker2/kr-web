import type { PostsResponse } from "../types/post";

const API = "https://api.kr.kroshhaker.dev";

export async function getPosts(
    page: number,
    limit = 100,
    filterQuery = "",
): Promise<PostsResponse> {
    const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
    });

    const tokens = filterQuery.trim().split(/\s+/).filter(Boolean);
    if (tokens.length > 0) {
        params.set("tags", tokens.join(" "));
    }

    const response = await fetch(`${API}/api/v1/posts?${params.toString()}`);

    if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
    }

    return response.json();
}

export async function updatePost(
    id: string,
    payload: Partial<{ tags: string[]; like: boolean }>,
) {
    const response = await fetch(`http://localhost:3000/api/v1/post/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
}

export async function deletePost(id: string) {
    const response = await fetch(`http://localhost:3000/api/post/${id}`, {
        method: "DELETE",
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
}

export async function setLike(id: string, liked: boolean): Promise<void> {
    const response = await fetch(`${API}/api/post/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            like: liked,
        }),
    });

    if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
    }
}
