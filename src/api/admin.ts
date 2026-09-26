import { API } from "@/config";
import {
    ModerationPostResponseSchema,
    type ModerationCommand,
    type ModerationPost,
    type ModerationPostChanges,
} from "@/types/admin";
import { throwApiError } from "./errors";

export async function getPendingModerationPost(): Promise<ModerationPost | null> {
    const response = await fetch(`${API}/admin/mod/posts?status=PENDING`, {
        credentials: "include",
    });

    if (response.status === 404) {
        return null;
    }

    if (!response.ok) {
        throw new Error("errors.moderationLoadFailed");
    }

    const data: unknown = await response.json();
    const { post, file, preview, count } =
        ModerationPostResponseSchema.parse(data).content;

    return { ...post, count, file, preview };
}

export async function moderatePost(
    id: string,
    changes: ModerationPostChanges,
    command: ModerationCommand,
): Promise<void> {
    const status = {
        APPROVE: "APPROVED",
        REJECT: "REJECTED",
        DELETE: "DELETED",
    } as const;

    const response = await fetch(`${API}/admin/posts`, {
        method: "PUT",
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            updates: [
                {
                    post: {
                        id,
                        ...changes,
                        status: status[command.type],
                    },
                    commands: [command],
                },
            ],
        }),
    });

    if (!response.ok) {
        await throwApiError(response, "errors.moderationActionFailed");
    }
}
