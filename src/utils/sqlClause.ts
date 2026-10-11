type TColumnValues = Record<string, string | undefined>;

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
