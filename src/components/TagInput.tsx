import {
    createEffect,
    createSignal,
    For,
    onCleanup,
    Show,
} from "solid-js";
import { searchTags } from "@/api/tags";
import { useI18n } from "@/i18n/context";
import type { Tag } from "@/types/tag";

interface TagInputProps {
    value: string[];
    onChange: (tags: string[]) => void;
    max?: number;
}

export default function TagInput(props: TagInputProps) {
    const { t } = useI18n();
    const [query, setQuery] = createSignal("");
    const [suggestions, setSuggestions] = createSignal<Tag[]>([]);
    const [activeIndex, setActiveIndex] = createSignal(0);
    const [focused, setFocused] = createSignal(false);
    const max = () => props.max ?? 30;

    const availableSuggestions = () =>
        suggestions()
            .filter((tag) => !props.value.includes(tag.name))
            .slice(0, 10);

    const isOpen = () => focused() && availableSuggestions().length > 0;

    createEffect(() => {
        const value = query().trim();

        if (!value || props.value.length >= max()) {
            setSuggestions([]);
            return;
        }

        const controller = new AbortController();
        const timeout = window.setTimeout(() => {
            void searchTags(value, controller.signal)
                .then((tags) => {
                    setSuggestions(tags);
                    setActiveIndex(0);
                })
                .catch((error: unknown) => {
                    if (
                        !(error instanceof DOMException) ||
                        error.name !== "AbortError"
                    ) {
                        setSuggestions([]);
                    }
                });
        }, 250);

        onCleanup(() => {
            window.clearTimeout(timeout);
            controller.abort();
        });
    });

    function addTag(tag: Tag) {
        if (props.value.length >= max() || props.value.includes(tag.name)) {
            return;
        }

        props.onChange([...props.value, tag.name]);
        setQuery("");
        setSuggestions([]);
        setActiveIndex(0);
    }

    function removeTag(name: string) {
        props.onChange(props.value.filter((tag) => tag !== name));
    }

    function onKeyDown(event: KeyboardEvent) {
        const options = availableSuggestions();

        if (event.key === "ArrowDown" && options.length > 0) {
            event.preventDefault();
            setActiveIndex((index) => (index + 1) % options.length);
            return;
        }

        if (event.key === "ArrowUp" && options.length > 0) {
            event.preventDefault();
            setActiveIndex(
                (index) => (index - 1 + options.length) % options.length,
            );
            return;
        }

        if ((event.key === "Enter" || event.key === "Tab") && isOpen()) {
            const selected = options[activeIndex()];
            if (selected) {
                event.preventDefault();
                addTag(selected);
            }
            return;
        }

        if (event.key === "Escape") {
            setSuggestions([]);
            return;
        }

        if (event.key === "Backspace" && !query() && props.value.length > 0) {
            const lastTag = props.value.at(-1);
            if (lastTag) removeTag(lastTag);
        }
    }

    return (
        <div class="tag-input">
            <div
                class={`tag-input-control ${focused() ? "is-focused" : ""}`}
                onClick={(event) =>
                    event.currentTarget.querySelector("input")?.focus()
                }
            >
                <For each={props.value}>
                    {(tag) => (
                        <span class="tag-input-chip">
                            {tag}
                            <button
                                type="button"
                                aria-label={`${t("common.removeTag")} ${tag}`}
                                onClick={() => removeTag(tag)}
                            >
                                ×
                            </button>
                        </span>
                    )}
                </For>

                <input
                    type="text"
                    value={query()}
                    disabled={props.value.length >= max()}
                    placeholder={
                        props.value.length === 0
                            ? t("common.tagsPlaceholder")
                            : undefined
                    }
                    role="combobox"
                    aria-autocomplete="list"
                    aria-expanded={isOpen()}
                    aria-controls="tag-suggestions"
                    onInput={(event) => setQuery(event.currentTarget.value)}
                    onKeyDown={onKeyDown}
                    onFocus={() => setFocused(true)}
                    onBlur={() => setFocused(false)}
                />
            </div>

            <Show when={isOpen()}>
                <ul id="tag-suggestions" class="tag-suggestions" role="listbox">
                    <For each={availableSuggestions()}>
                        {(tag, index) => (
                            <li
                                class={index() === activeIndex() ? "active" : ""}
                                role="option"
                                aria-selected={index() === activeIndex()}
                                onMouseDown={(event) => event.preventDefault()}
                                onClick={() => addTag(tag)}
                            >
                                <span>{tag.name}</span>
                                <small>{t(`tagTypes.${tag.type}`)}</small>
                            </li>
                        )}
                    </For>
                </ul>
            </Show>
        </div>
    );
}

