import { StatusCodes } from "http-status-codes";
import { pool } from "../../config/db";
import AppError from "../../utils/AppError";
import { ICreateIssuePayload, IIssue } from "./issue.interface";

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

export const issueService = {
    createIssue,
};
