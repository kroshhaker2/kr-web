export type Rating = "SAFE" | "QUESTIONABLE" | "EXPLICIT";

export interface Post {
    id: string;
    file: string;
    preview: string;
    tags: string[];
    rating: Rating;
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
