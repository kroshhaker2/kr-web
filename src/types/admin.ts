import { z } from "zod";

export const ModerationPostSchema = z.object({
    id: z.string(),
    title: z.string().nullable(),
    description: z.string().nullable(),
    rating: z.enum(["SAFE", "QUESTIONABLE", "EXPLICIT"]),
    originalFilename: z.string(),
    mimeType: z.string(),
    size: z
        .union([z.number(), z.string()])
        .transform((value) => Number(value)),
    originalKey: z.string(),
    previewKey: z.string().nullable(),
    createdAt: z.string(),
    uploadedById: z.string().nullable(),
    uploadedBy: z
        .object({
            id: z.string(),
            username: z.string(),
        })
        .nullable(),
    moderatedById: z.string().nullable(),
    moderatedAt: z.string().nullable(),
    tags: z.array(
        z.object({
            name: z.string(),
        }),
    ),
    suggestedTags: z.string().nullable(),
    status: z.enum(["PENDING", "APPROVED", "REJECTED", "DELETED"]),
    views: z.number(),
    favorites: z.number(),
    sourceUrl: z.string().nullable(),
    deletedAt: z.string().nullable(),
});

export const ModerationPostResponseSchema = z.object({
    content: z.object({
        post: ModerationPostSchema,
        count: z.number(),
        file: z.string(),
        preview: z.string(),
    }),
});

export type ModerationPost = z.infer<typeof ModerationPostSchema> & {
    count: number;
    file: string;
    preview: string;
};

export type ModerationPostChanges = {
    title: string | null;
    description: string | null;
    rating: ModerationPost["rating"];
    tags: string[];
    suggestedTags: string | null;
    sourceUrl: string | null;
};

export type ModerationCommand =
    | { type: "APPROVE" }
    | { type: "REJECT"; reason: string }
    | { type: "DELETE"; reason: string | null };

export const TagTypeSchema = z.enum([
    "GENERAL",
    "META",
    "AUTHOR",
    "CHARACTER",
    "SPECIES",
    "SERIES",
    "SOURCE",
    "LOCATION",
    "EVENT",
    "COPYRIGHT",
]);

export const AdminTagSchema = z.object({
    id: z.number(),
    name: z.string(),
    type: TagTypeSchema,
});

export const AdminTagsResponseSchema = z
    .union([
        z.array(AdminTagSchema),
        z.object({ content: z.array(AdminTagSchema) }),
        z.object({ tags: z.array(AdminTagSchema) }),
        z.object({ content: z.object({ tags: z.array(AdminTagSchema) }) }),
    ])
    .transform((value) => {
        if (Array.isArray(value)) return value;
        if ("tags" in value) return value.tags;
        return Array.isArray(value.content)
            ? value.content
            : value.content.tags;
    });

export type TagType = z.infer<typeof TagTypeSchema>;
export type AdminTag = z.infer<typeof AdminTagSchema>;
export type TagInput = Pick<AdminTag, "name" | "type">;

export const TAG_TYPES = TagTypeSchema.options;
