import { StatusCodes } from "http-status-codes";
import { pool } from "../../config/db";
import AppError from "../../utils/AppError";
import { buildWhereClause } from "../../utils/sqlClause";
import { ICreateIssuePayload, IIssue, IIssueQuery, IIssueWithReporter, IReporter } from "./issue.interface";

const createIssue = async (payload: ICreateIssuePayload, reporterId: number): Promise<IIssue> => {
    const reporter = await pool.query("SELECT id FROM users WHERE id = $1", [reporterId]);

    if (!reporter.rows.length) {
        throw new AppError(StatusCodes.NOT_FOUND, "Reporter not found", "The user of this token does not exist");
    }

    const result = await pool.query<IIssue>(
        `INSERT INTO issues(title, description, type, reporter_id)
        VALUES($1, $2, $3, $4)
        RETURNING *`,
        [payload.title.trim(), payload.description.trim(), payload.type, reporterId]
    );

    const issue = result.rows[0];

    if (!issue) {
        throw new AppError(StatusCodes.INTERNAL_SERVER_ERROR, "Issue creation failed", "Issue could not be created");
    }

    return issue;
};

const getReporters = async (reporterIds: number[]): Promise<Map<number, IReporter>> => {
    const reporters = new Map<number, IReporter>();

    if (!reporterIds.length) {
        return reporters;
    }

    const result = await pool.query<IReporter>("SELECT id, name, role FROM users WHERE id = ANY($1)", [reporterIds]);

    result.rows.forEach((reporter) => reporters.set(reporter.id, reporter));

    return reporters;
};

const attachReporter = (issue: IIssue, reporter: IReporter | undefined): IIssueWithReporter => {
    return {
        id: issue.id,
        title: issue.title,
        description: issue.description,
        type: issue.type,
        status: issue.status,
        reporter: reporter ?? null,
        created_at: issue.created_at,
        updated_at: issue.updated_at,
    };
};

const getAllIssues = async (query: IIssueQuery): Promise<IIssueWithReporter[]> => {
    const { clause, values } = buildWhereClause({ type: query.type, status: query.status });
    const order = query.sort === "oldest" ? "ASC" : "DESC";

    const result = await pool.query<IIssue>(
        `SELECT * FROM issues ${clause} ORDER BY created_at ${order}, id ${order}`,
        values
    );

    const reporterIds = [...new Set(result.rows.map((issue) => issue.reporter_id))];
    const reporters = await getReporters(reporterIds);

    return result.rows.map((issue) => attachReporter(issue, reporters.get(issue.reporter_id)));
};

const getIssueById = async (id: number): Promise<IIssue> => {
    const result = await pool.query<IIssue>("SELECT * FROM issues WHERE id = $1", [id]);
    const issue = result.rows[0];

    if (!issue) {
        throw new AppError(StatusCodes.NOT_FOUND, "Issue not found", `No issue found with id ${id}`);
    }

    return issue;
};

const getSingleIssue = async (id: number): Promise<IIssueWithReporter> => {
    const issue = await getIssueById(id);
    const reporters = await getReporters([issue.reporter_id]);

    return attachReporter(issue, reporters.get(issue.reporter_id));
};

export const issueService = {
    createIssue,
    getAllIssues,
    getSingleIssue,
};
