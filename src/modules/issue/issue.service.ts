import { StatusCodes } from "http-status-codes";
import { pool } from "../../config/db";
import AppError from "../../utils/AppError";
import { buildSetClause, buildWhereClause } from "../../utils/sqlClause";
import { ITokenPayload } from "../auth/auth.interface";
import {
    ICreateIssuePayload,
    IIssue,
    IIssueQuery,
    IIssueWithReporter,
    IReporter,
    IUpdateIssuePayload,
} from "./issue.interface";

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

// no JOIN is used, so all reporters are loaded with one extra query
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

    // same user can report many issues, so only unique ids are sent
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

const updateIssue = async (id: number, payload: IUpdateIssuePayload, user: ITokenPayload): Promise<IIssue> => {
    const issue = await getIssueById(id);

    // maintainer can update anything, contributor only own issue while it is open
    if (user.role === "contributor") {
        if (issue.reporter_id !== user.id) {
            throw new AppError(StatusCodes.FORBIDDEN, "Forbidden access", "You can only update your own issue");
        }

        if (payload.status !== undefined) {
            throw new AppError(StatusCodes.FORBIDDEN, "Forbidden access", "Only a maintainer can change the issue status");
        }

        if (issue.status !== "open") {
            throw new AppError(StatusCodes.CONFLICT, "Issue cannot be updated", `This issue is already ${issue.status}`);
        }
    }

    const { clause, values } = buildSetClause({
        title: payload.title?.trim(),
        description: payload.description?.trim(),
        type: payload.type,
        status: payload.status,
    });

    // id takes the next placeholder after the updated fields
    const result = await pool.query<IIssue>(
        `UPDATE issues SET ${clause}, updated_at = NOW() WHERE id = $${values.length + 1} RETURNING *`,
        [...values, id]
    );

    const updatedIssue = result.rows[0];

    if (!updatedIssue) {
        throw new AppError(StatusCodes.NOT_FOUND, "Issue not found", `No issue found with id ${id}`);
    }

    return updatedIssue;
};

const deleteIssue = async (id: number): Promise<void> => {
    const result = await pool.query("DELETE FROM issues WHERE id = $1", [id]);

    if (!result.rowCount) {
        throw new AppError(StatusCodes.NOT_FOUND, "Issue not found", `No issue found with id ${id}`);
    }
};

export const issueService = {
    createIssue,
    getAllIssues,
    getSingleIssue,
    updateIssue,
    deleteIssue,
};
