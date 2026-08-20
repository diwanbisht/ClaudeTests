import * as dotenv from 'dotenv';

dotenv.config();

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function optional(name: string, fallback: string): string {
  return process.env[name] ?? fallback;
}

export const config = {
  baseUrl: optional('BASE_URL', 'https://the-internet.herokuapp.com'),
  uiWebAppUrl: optional('UI_WEB_APP_URL', 'http://localhost:5500'),

  jira: {
    baseUrl: () => required('JIRA_BASE_URL'),
    email: () => required('JIRA_EMAIL'),
    apiToken: () => required('JIRA_API_TOKEN'),
  },

  xray: {
    clientId: () => required('XRAY_CLIENT_ID'),
    clientSecret: () => required('XRAY_CLIENT_SECRET'),
  },

  claude: {
    apiKey: () => required('ANTHROPIC_API_KEY'),
    model: optional('ANTHROPIC_MODEL', 'claude-sonnet-5'),
  },

  chroma: {
    host: optional('CHROMA_HOST', 'localhost'),
    port: Number(optional('CHROMA_PORT', '8000')),
  },

  ollama: {
    url: optional('OLLAMA_URL', 'http://localhost:11434'),
    embedModel: optional('OLLAMA_EMBED_MODEL', 'nomic-embed-text'),
    generateModel: optional('OLLAMA_GENERATE_MODEL', 'llama3'),
  },

  mysql: {
    host: optional('MYSQL_HOST', 'localhost'),
    port: Number(optional('MYSQL_PORT', '3306')),
    user: optional('MYSQL_USER', 'root'),
    password: optional('MYSQL_PASSWORD', ''),
    database: optional('MYSQL_DATABASE', 'test_automation'),
  },

  logLevel: optional('LOG_LEVEL', 'info'),
};
