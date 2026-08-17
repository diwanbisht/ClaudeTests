import axios from 'axios';
import { config } from '../../utils/config';
import { createJiraClient } from './jiraClient';

const XRAY_AUTH_URL = 'https://xray.cloud.getxray.app/api/v2/authenticate';
const XRAY_GRAPHQL_URL = 'https://xray.cloud.getxray.app/api/v2/graphql';

export interface ManualTestStep {
  action: string;
  data?: string;
  result: string;
}

export interface ManualTestCase {
  summary: string;
  steps: ManualTestStep[];
}

async function authenticate(): Promise<string> {
  const { data: token } = await axios.post(XRAY_AUTH_URL, {
    client_id: config.xray.clientId(),
    client_secret: config.xray.clientSecret(),
  });
  return token as string;
}

/** Creates a manual Xray Test issue in the given Jira project. Returns the created issue key (e.g. "PROJ-456"). */
export async function createXrayManualTest(
  projectKey: string,
  testCase: ManualTestCase,
): Promise<string> {
  const token = await authenticate();

  const mutation = `
    mutation CreateManualTest($testType: UpdateTestTypeInput!, $steps: [CreateStepInput], $project: String!, $summary: String!) {
      createTest(
        testType: $testType
        steps: $steps
        jira: { fields: { project: { key: $project }, summary: $summary, issuetype: { name: "Test" } } }
      ) {
        test { issueId jira(fields: ["key"]) }
        warnings
      }
    }
  `;

  const { data } = await axios.post(
    XRAY_GRAPHQL_URL,
    {
      query: mutation,
      variables: {
        testType: { name: 'Manual' },
        steps: testCase.steps.map((s) => ({ action: s.action, data: s.data ?? '', result: s.result })),
        project: projectKey,
        summary: testCase.summary,
      },
    },
    { headers: { Authorization: `Bearer ${token}` } },
  );

  const key = data?.data?.createTest?.test?.jira?.key;
  if (!key) {
    throw new Error(`Xray createTest did not return an issue key: ${JSON.stringify(data)}`);
  }
  return key as string;
}

/** Links a Test issue to its source requirement using a standard Jira "Tests" issue link. */
export async function linkTestToRequirement(
  testIssueKey: string,
  requirementKey: string,
  linkType: string = 'Tests',
): Promise<void> {
  const client = createJiraClient();
  await client.post('/issueLink', {
    type: { name: linkType },
    inwardIssue: { key: testIssueKey },
    outwardIssue: { key: requirementKey },
  });
}
