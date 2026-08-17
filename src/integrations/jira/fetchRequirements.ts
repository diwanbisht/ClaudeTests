import { createJiraClient } from './jiraClient';

export interface Requirement {
  key: string;
  summary: string;
  description: string;
  acceptanceCriteria: string;
}

/** Extracts plain text from a Jira v3 (Atlassian Document Format) description field. */
function extractText(adf: unknown): string {
  if (!adf || typeof adf !== 'object') return '';
  const node = adf as { text?: string; content?: unknown[] };
  if (typeof node.text === 'string') return node.text;
  if (Array.isArray(node.content)) {
    return node.content.map(extractText).join('\n');
  }
  return '';
}

// Field ID for "Acceptance Criteria" varies per Jira instance/scheme; override via env if set.
const ACCEPTANCE_CRITERIA_FIELD = process.env.JIRA_ACCEPTANCE_CRITERIA_FIELD;

/** Fetches a single Jira issue and normalizes it into a Requirement. */
export async function fetchRequirement(issueKey: string): Promise<Requirement> {
  const client = createJiraClient();
  const { data } = await client.get(`/issue/${issueKey}`);

  return {
    key: data.key,
    summary: data.fields.summary ?? '',
    description: extractText(data.fields.description),
    acceptanceCriteria: ACCEPTANCE_CRITERIA_FIELD
      ? extractText(data.fields[ACCEPTANCE_CRITERIA_FIELD])
      : '',
  };
}

/** Runs a JQL search and returns normalized Requirements for every matching issue. */
export async function fetchRequirementsByJql(jql: string): Promise<Requirement[]> {
  const client = createJiraClient();
  const { data } = await client.post('/search', { jql, maxResults: 50 });

  const issues = data.issues as Array<{ key: string }>;
  return Promise.all(issues.map((issue) => fetchRequirement(issue.key)));
}
