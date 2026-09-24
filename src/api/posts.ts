import type {
    PostsResponse,
    UpdatePostPayload,
    UpdatePostResponse,
} from "../types/post";
import { API } from "@/config";


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
        params.set("tags", tokens.join("+"));
    }

    const response = await fetch(`${API}/posts?${params.toString()}`);

    if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
    }

    return (await response.json()) as PostsResponse;
}

export async function updatePost(
    id: string,
    payload: UpdatePostPayload,
): Promise<UpdatePostResponse> {
    const response = await fetch(`${API}/post/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
    }

    return (await response.json()) as UpdatePostResponse;
}

export async function deletePost(id: string) {
    const response = await fetch(`${API}/post/${id}`, {
        method: "DELETE",
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
}

export async function setLike(id: string, liked: boolean): Promise<void> {
    const response = await fetch(`${API}/post/${id}`, {
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
