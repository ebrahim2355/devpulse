import { isNonEmptyString, isOneOf } from "../../utils/validators";
import { issueSortOptions, issueStatuses, issueTypes } from "./issue.interface";

const checkTitle = (title: unknown, errors: string[]) => {
    if (!isNonEmptyString(title)) {
        errors.push("title is required");
    } else if (title.trim().length > 150) {
        errors.push("title must not be more than 150 characters");
    }
};

const checkDescription = (description: unknown, errors: string[]) => {
    if (!isNonEmptyString(description)) {
        errors.push("description is required");
    } else if (description.trim().length < 20) {
        errors.push("description must be at least 20 characters");
    }
};

const checkType = (type: unknown, errors: string[]) => {
    if (!isOneOf(type, issueTypes)) {
        errors.push("type must be bug or feature_request");
    }
};

const validateCreateIssue = (body: Record<string, unknown>): string[] => {
    const errors: string[] = [];

    checkTitle(body.title, errors);
    checkDescription(body.description, errors);
    checkType(body.type, errors);

    return errors;
};

const validateIssueQuery = (query: Record<string, unknown>): string[] => {
    const errors: string[] = [];
    const { sort, type, status } = query;

    if (sort !== undefined && !isOneOf(sort, issueSortOptions)) {
        errors.push("sort must be newest or oldest");
    }

    if (type !== undefined) {
        checkType(type, errors);
    }

    if (status !== undefined && !isOneOf(status, issueStatuses)) {
        errors.push("status must be open, in_progress or resolved");
    }

    return errors;
};

export const issueValidation = {
    validateCreateIssue,
    validateIssueQuery,
};
