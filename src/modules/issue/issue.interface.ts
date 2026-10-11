export const issueTypes = ["bug", "feature_request"] as const;
export const issueStatuses = ["open", "in_progress", "resolved"] as const;

export type TIssueType = (typeof issueTypes)[number];
export type TIssueStatus = (typeof issueStatuses)[number];

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

export interface ICreateIssuePayload {
    title: string;
    description: string;
    type: TIssueType;
}
