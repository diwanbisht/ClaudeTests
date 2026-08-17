import { Requirement } from '../jira/fetchRequirements';
import { askClaudeForJson } from './claudeClient';
import { ManualTestCase } from '../jira/xrayClient';

const SYSTEM_PROMPT = `You are a senior QA engineer writing manual test cases for Xray/Jira.
Given a requirement (summary, description, acceptance criteria), produce one or more manual
test cases covering the happy path and the most important edge/negative cases. Respond with
ONLY a JSON array matching this TypeScript type, no prose, no markdown fences:

type ManualTestCase = {
  summary: string;       // short test case title
  steps: {
    action: string;      // what the tester does
    data?: string;        // input data used, if any
    result: string;       // expected result
  }[];
};`;

/** Uses Claude to turn a Jira requirement into one or more structured manual test cases. */
export async function generateManualTestCases(requirement: Requirement): Promise<ManualTestCase[]> {
  const userPrompt = `Requirement ${requirement.key}: ${requirement.summary}

Description:
${requirement.description || '(none provided)'}

Acceptance Criteria:
${requirement.acceptanceCriteria || '(none provided)'}`;

  return askClaudeForJson<ManualTestCase[]>(SYSTEM_PROMPT, userPrompt);
}
