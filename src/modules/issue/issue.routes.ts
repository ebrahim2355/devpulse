import { Router } from "express";
import auth from "../../middleware/auth";
import validateRequest from "../../middleware/validateRequest";
import { issueController } from "./issue.controller";
import { issueValidation } from "./issue.validation";

const router = Router();

router.post(
    "/",
    auth("contributor", "maintainer"),
    validateRequest(issueValidation.validateCreateIssue),
    issueController.createIssue
);

router.get("/", validateRequest(issueValidation.validateIssueQuery, "query"), issueController.getAllIssues);

export const issueRoutes = router;
