import axios, { AxiosInstance } from 'axios';
import { config } from '../../utils/config';

/** Thin wrapper around the Jira Cloud REST API v3, authenticated via email + API token. */
export function createJiraClient(): AxiosInstance {
  const token = Buffer.from(`${config.jira.email()}:${config.jira.apiToken()}`).toString('base64');

  return axios.create({
    baseURL: `${config.jira.baseUrl()}/rest/api/3`,
    headers: {
      Authorization: `Basic ${token}`,
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  });
}
