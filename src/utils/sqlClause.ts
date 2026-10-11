type TColumnValues = Record<string, string | undefined>;

// makes "column = $1" pairs and skips the fields that are not given
const buildColumnPairs = (fields: TColumnValues) => {
    const pairs: string[] = [];
    const values: string[] = [];

    Object.entries(fields).forEach(([column, value]) => {
        if (value !== undefined) {
            values.push(value);
            pairs.push(`${column} = $${values.length}`);
        }
    });

    return { pairs, values };
};

export const buildWhereClause = (filters: TColumnValues) => {
    const { pairs, values } = buildColumnPairs(filters);

    return {
        clause: pairs.length ? `WHERE ${pairs.join(" AND ")}` : "",
        values,
    };
};

export const buildSetClause = (fields: TColumnValues) => {
    const { pairs, values } = buildColumnPairs(fields);

    return {
        clause: pairs.join(", "),
        values,
    };
};
