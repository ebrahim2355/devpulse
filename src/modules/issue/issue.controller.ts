import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { ITokenPayload } from "../auth/auth.interface";
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

export const issueController = {
    createIssue,
};
