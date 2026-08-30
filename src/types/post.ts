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
