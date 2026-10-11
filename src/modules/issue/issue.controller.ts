import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { ITokenPayload } from "../auth/auth.interface";
import { IIssueQuery } from "./issue.interface";
import { issueService } from "./issue.service";

const createIssue = catchAsync(async (req: Request, res: Response) => {
    const user = req.user as ITokenPayload;
    const result = await issueService.createIssue(req.body, user.id);

    sendResponse(res, {
        statusCode: StatusCodes.CREATED,
        message: "Issue created successfully",
        data: result,
    });
});

const getAllIssues = catchAsync(async (req: Request, res: Response) => {
    const result = await issueService.getAllIssues(req.query as IIssueQuery);

    sendResponse(res, {
        statusCode: StatusCodes.OK,
        message: "Issues retrived successfully",
        data: result,
    });
});

export const issueController = {
    createIssue,
    getAllIssues,
};
