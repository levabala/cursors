export type Enum<T extends Array<string>> = {
    [value in T[number]]: value;
};

export function createEnum<const T extends Array<string>>(...values: [...T]) {
    const obj: Record<string, string> = {};
    for (const value of values) {
        obj[value] = value;
    }

    return obj as Enum<T>;
}

export type EnumValues<E> = E extends Enum<infer T> ? T[number] : never;

