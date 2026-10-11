export const isRecord = (value: unknown): value is Record<string, unknown> => {
    return typeof value === "object" && value !== null && !Array.isArray(value);
};

export const isNonEmptyString = (value: unknown): value is string => {
    return typeof value === "string" && value.trim().length > 0;
};

export const isOneOf = <T extends string>(value: unknown, options: readonly T[]): value is T => {
    return typeof value === "string" && options.includes(value as T);
};
