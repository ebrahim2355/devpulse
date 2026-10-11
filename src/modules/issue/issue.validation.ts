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

const checkStatus = (status: unknown, errors: string[]) => {
    if (!isOneOf(status, issueStatuses)) {
        errors.push("status must be open, in_progress or resolved");
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

    if (status !== undefined) {
        checkStatus(status, errors);
    }

    return errors;
};

const validateUpdateIssue = (body: Record<string, unknown>): string[] => {
    const errors: string[] = [];
    const { title, description, type, status } = body;

    if (title === undefined && description === undefined && type === undefined && status === undefined) {
        errors.push("at least one of title, description, type or status is required");
        return errors;
    }

    if (title !== undefined) {
        checkTitle(title, errors);
    }

    if (description !== undefined) {
        checkDescription(description, errors);
    }

    if (type !== undefined) {
        checkType(type, errors);
    }

    if (status !== undefined) {
        checkStatus(status, errors);
    }

    return errors;
};

export const issueValidation = {
    validateCreateIssue,
    validateIssueQuery,
    validateUpdateIssue,
};
