import { Requirement } from '../jira/fetchRequirements';
import { askClaudeForJson } from './claudeClient';
import { ManualTestCase } from '../jira/xrayClient';
import { retrieveSimilarTestCases } from '../../rag/frameworkKnowledgeBase';

const SYSTEM_PROMPT = `You are a senior QA engineer writing manual test cases for Xray/Jira.
Given a requirement (summary, description, acceptance criteria) and, where available, a set of
similar existing test cases already in this framework, produce one or more manual test cases
covering the happy path and the most important edge/negative cases. Reuse the terminology and
scenario shape of the similar existing test cases where it fits, and avoid duplicating a
scenario they already cover. Respond with ONLY a JSON array matching this TypeScript type, no
prose, no markdown fences:

type ManualTestCase = {
  summary: string;       // short test case title
  steps: {
    action: string;      // what the tester does
    data?: string;        // input data used, if any
    result: string;       // expected result
  }[];
};`;

/**
 * Uses Claude to turn a Jira requirement into one or more structured manual test cases.
 *
 * Before generating, retrieves the most similar existing manual test cases from the
 * framework's own RAG knowledge base (`src/rag/frameworkKnowledgeBase.ts`) and includes
 * them as grounding context — retrieval-before-generation, so Claude reuses existing
 * scenario shape/terminology instead of inventing conventions from scratch. This is a
 * best-effort enhancement: if the local Ollama/Chroma RAG stack isn't running, retrieval
 * returns no context and generation proceeds exactly as it did before this was added.
 */
export async function generateManualTestCases(requirement: Requirement): Promise<ManualTestCase[]> {
  const similarContext = await retrieveSimilarTestCases(
    `${requirement.summary}\n${requirement.description ?? ''}`,
  );

  const userPrompt = `Requirement ${requirement.key}: ${requirement.summary}

Description:
${requirement.description || '(none provided)'}

Acceptance Criteria:
${requirement.acceptanceCriteria || '(none provided)'}${
    similarContext
      ? `\n\nSimilar existing test cases already in this framework (for style/reuse guidance — do not just repeat these, cover what's new in the requirement above):\n${similarContext}`
      : ''
  }`;

  return askClaudeForJson<ManualTestCase[]>(SYSTEM_PROMPT, userPrompt);
}
