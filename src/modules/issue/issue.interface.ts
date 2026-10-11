import { TUserRole } from "../auth/auth.interface";

export const issueTypes = ["bug", "feature_request"] as const;
export const issueStatuses = ["open", "in_progress", "resolved"] as const;
export const issueSortOptions = ["newest", "oldest"] as const;

export type TIssueType = (typeof issueTypes)[number];
export type TIssueStatus = (typeof issueStatuses)[number];
export type TIssueSort = (typeof issueSortOptions)[number];

export interface IIssue {
    id: number;
    title: string;
    description: string;
    type: TIssueType;
    status: TIssueStatus;
    reporter_id: number;
    created_at: Date;
    updated_at: Date;
}

export interface IReporter {
    id: number;
    name: string;
    role: TUserRole;
}

export interface IIssueWithReporter extends Omit<IIssue, "reporter_id"> {
    reporter: IReporter | null;
}

export interface ICreateIssuePayload {
    title: string;
    description: string;
    type: TIssueType;
}

export interface IIssueQuery {
    sort?: TIssueSort;
    type?: TIssueType;
    status?: TIssueStatus;
}
