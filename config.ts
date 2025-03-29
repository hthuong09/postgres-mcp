import { URL } from "url";

export interface DatabaseConfig {
  connectionString?: string;
  host?: string;
  port?: number;
  database?: string;
  user?: string;
  password?: string;
  ssl?: boolean;
  schema?: string;
}

function parsePortNumber(port: string | undefined): number | undefined {
  if (!port) return undefined;
  const parsedPort = parseInt(port, 10);
  return isNaN(parsedPort) ? undefined : parsedPort;
}

function parseBooleanValue(value: string | undefined): boolean | undefined {
  if (!value) return undefined;
  return value.toLowerCase() === "true";
}

function buildConnectionString(config: DatabaseConfig): string {
  const url = new URL("postgres://");
  url.hostname = config.host || "localhost";
  if (config.port) url.port = config.port.toString();
  if (config.database) url.pathname = `/${config.database}`;
  if (config.user) url.username = config.user;
  if (config.password) url.password = config.password;
  return url.toString();
}

export function loadDatabaseConfig(commandLineUrl?: string): DatabaseConfig {
  // Priority 1: Environment variable POSTGRES_URL
  if (process.env.POSTGRES_URL) {
    return {
      connectionString: process.env.POSTGRES_URL,
      schema: process.env.POSTGRES_SCHEMA || "public",
    };
  }

  // Priority 2: Individual environment variables
  const envConfig: DatabaseConfig = {
    host: process.env.POSTGRES_HOST,
    port: parsePortNumber(process.env.POSTGRES_PORT),
    database: process.env.POSTGRES_DB,
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    ssl: parseBooleanValue(process.env.POSTGRES_SSL),
    schema: process.env.POSTGRES_SCHEMA || "public",
  };

  // Check if we have enough environment variables to form a connection
  if (envConfig.host && envConfig.database && envConfig.user) {
    // If we have the minimum required env vars, build a connection string
    return {
      connectionString: buildConnectionString(envConfig),
      ssl: envConfig.ssl,
      schema: envConfig.schema,
    };
  }

  // Priority 3: Command line argument
  if (commandLineUrl) {
    return {
      connectionString: commandLineUrl,
      schema: process.env.POSTGRES_SCHEMA || "public",
    };
  }

  throw new Error(
    "No valid database configuration found. Please provide either:\n" +
      "1. POSTGRES_URL environment variable\n" +
      "2. Individual environment variables (POSTGRES_HOST, POSTGRES_DB, POSTGRES_USER)\n" +
      "3. Command line URL argument"
  );
}

export function constructResourceBaseUrl(config: DatabaseConfig): URL {
  let baseUrl: URL;

  if (config.connectionString) {
    baseUrl = new URL(config.connectionString);
  } else {
    baseUrl = new URL("postgres://");
    baseUrl.hostname = config.host || "localhost";
    if (config.port) baseUrl.port = config.port.toString();
    if (config.database) baseUrl.pathname = `/${config.database}`;
    if (config.user) baseUrl.username = config.user;
  }

  // Always set protocol to postgres and remove password for resource URLs
  baseUrl.protocol = "postgres:";
  baseUrl.password = "";

  return baseUrl;
}
