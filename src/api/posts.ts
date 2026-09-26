import type {
    PostsResponse,
    Rating,
    UpdatePostPayload,
    UpdatePostResponse,
} from "../types/post";
import { API } from "@/config";

interface CreatePostPayload {
    file: File;
    title: string;
    description: string;
    tags: string[];
    rating: Rating;
}

export async function createPost(payload: CreatePostPayload): Promise<void> {
    const formData = new FormData();

    formData.append(
        "metadata",
        JSON.stringify({
            title: payload.title,
            description: payload.description,
            tags: payload.tags,
            rating: payload.rating,
        }),
    );
    formData.append("file", payload.file);

    const response = await fetch(`${API}/posts`, {
        method: "POST",
        credentials: "include",
        body: formData,
    });

    if (!response.ok) {
        throw new Error("errors.uploadFailed");
    }
}

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
