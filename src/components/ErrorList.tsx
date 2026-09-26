import { For, Show } from "solid-js";
import { useI18n, type TranslationKey } from "@/i18n/context";

interface ErrorListProps {
    error: Error | null;
    fallback: TranslationKey;
    class?: string;
}

export default function ErrorList(props: ErrorListProps) {
    const { errorMessages } = useI18n();

    return (
        <Show when={props.error}>
            {(error) => (
                <ul class={props.class ?? "form-error error-list"}>
                    <For each={errorMessages(error(), props.fallback)}>
                        {(message) => <li>{message}</li>}
                    </For>
                </ul>
            )}
        </Show>
    );
}
