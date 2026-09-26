import { z } from "zod";

const ValidationDetailSchema = z.object({
    code: z.string(),
    message: z.string(),
    path: z.string(),
});

const ErrorResponseSchema = z.object({
    error: z.object({
        code: z.string(),
        message: z.string(),
        details: z.array(ValidationDetailSchema).optional(),
    }),
});

export type ValidationDetail = z.infer<typeof ValidationDetailSchema>;

export class ApiError extends Error {
    readonly code: string;
    readonly details: ValidationDetail[];

    constructor(code: string, message: string, details: ValidationDetail[] = []) {
        super(message);
        this.name = "ApiError";
        this.code = code;
        this.details = details;
    }
}

export async function throwApiError(
    response: Response,
    fallbackCode: string,
): Promise<never> {
    const body: unknown = await response.json().catch(() => null);
    const parsed = ErrorResponseSchema.safeParse(body);

    if (parsed.success) {
        const { code, message, details } = parsed.data.error;
        throw new ApiError(code, message, details);
    }

    throw new Error(fallbackCode);
}
