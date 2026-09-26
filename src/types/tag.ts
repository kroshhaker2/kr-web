export interface Tag {
    id: number;
    name: string;
    type:
        | "GENERAL"
        | "META"
        | "AUTHOR"
        | "CHARACTER"
        | "SPECIES"
        | "SERIES"
        | "SOURCE"
        | "LOCATION"
        | "EVENT"
        | "COPYRIGHT";
}

