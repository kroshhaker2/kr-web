export interface Post {
    id: string;
    file: string;
    preview: string;
    tags: string[];
    liked: boolean;
}

export interface PostsResponse {
    content: Post[];
    pages: number;
}

export type UpdatePostPayload = Partial<{
    tags: string[];
    like: boolean;
}>;

export type UpdatePostResponse = Partial<{
    tags: string[];
    like: boolean;
}>;
