import { API } from "@/config";
import type { Tag } from "@/types/tag";

interface TagsResponse {
    content: {
        data: Tag[];
    };
}

export async function searchTags(
    query: string,
    signal?: AbortSignal,
): Promise<Tag[]> {
    const params = new URLSearchParams({ q: query });
    const response = await fetch(`${API}/tags?${params.toString()}`, {
        signal,
    });

    if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
    }

    const data = (await response.json()) as TagsResponse;
    return data.content.data;
}

