import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import catchAsync from "../../utils/catchAsync";
import parseId from "../../utils/parseId";
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

const getSingleIssue = catchAsync(async (req: Request, res: Response) => {
    const id = parseId(req.params.id);
    const result = await issueService.getSingleIssue(id);

    sendResponse(res, {
        statusCode: StatusCodes.OK,
        message: "Issue retrived successfully",
        data: result,
    });
});

const updateIssue = catchAsync(async (req: Request, res: Response) => {
    const id = parseId(req.params.id);
    const user = req.user as ITokenPayload;
    const result = await issueService.updateIssue(id, req.body, user);

    sendResponse(res, {
        statusCode: StatusCodes.OK,
        message: "Issue updated successfully",
        data: result,
    });
});

const deleteIssue = catchAsync(async (req: Request, res: Response) => {
    const id = parseId(req.params.id);
    await issueService.deleteIssue(id);

    sendResponse(res, {
        statusCode: StatusCodes.OK,
        message: "Issue deleted successfully",
    });
});

export const issueController = {
    createIssue,
    getAllIssues,
    getSingleIssue,
    updateIssue,
    deleteIssue,
};
