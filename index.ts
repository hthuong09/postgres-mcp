#!/usr/bin/env node
import dotenv from "dotenv";

const pwd = process.env.PWD ?? "";
const home = process.env.HOME ?? "";

dotenv.config(
  process.env.DOTENV_PATH
    ? {
        path: process.env.DOTENV_PATH.replace("{home}", home).replace(
          "{pwd}",
          pwd
        ),
      }
    : { path: `${pwd}/.env` } // This is workaround for Cursor as it always run command in root directory
);

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListResourcesRequestSchema,
  ListToolsRequestSchema,
  ReadResourceRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import pg from "pg";
import { loadDatabaseConfig, constructResourceBaseUrl } from "./config.js";

const server = new Server(
  {
    name: "example-servers/postgres",
    version: "0.1.0",
  },
  {
    capabilities: {
      resources: {},
      tools: {},
    },
  }
);

const args = process.argv.slice(2);
const commandLineUrl = args.length > 0 ? args[0] : undefined;

try {
  const config = loadDatabaseConfig(commandLineUrl);
  const resourceBaseUrl = constructResourceBaseUrl(config);
  const pool = new pg.Pool(config);

  const SCHEMA_PATH = "schema";

  server.setRequestHandler(ListResourcesRequestSchema, async () => {
    const client = await pool.connect();
    try {
      const result = await client.query(
        "SELECT table_name FROM information_schema.tables WHERE table_schema = $1",
        [config.schema || "public"]
      );
      return {
        resources: result.rows.map((row) => ({
          uri: new URL(`${row.table_name}/${SCHEMA_PATH}`, resourceBaseUrl)
            .href,
          mimeType: "application/json",
          name: `"${row.table_name}" database schema`,
        })),
      };
    } finally {
      client.release();
    }
  });

  server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
    const resourceUrl = new URL(request.params.uri);

    const pathComponents = resourceUrl.pathname.split("/");
    const schema = pathComponents.pop();
    const tableName = pathComponents.pop();

    if (schema !== SCHEMA_PATH) {
      throw new Error("Invalid resource URI");
    }

    const client = await pool.connect();
    try {
      const result = await client.query(
        "SELECT column_name, data_type FROM information_schema.columns WHERE table_name = $1",
        [tableName]
      );

      return {
        contents: [
          {
            uri: request.params.uri,
            mimeType: "application/json",
            text: JSON.stringify(result.rows, null, 2),
          },
        ],
      };
    } finally {
      client.release();
    }
  });

  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
      tools: [
        {
          name: "query",
          description: "Run a read-only SQL query",
          inputSchema: {
            type: "object",
            properties: {
              sql: { type: "string" },
            },
          },
        },
      ],
    };
  });

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    if (request.params.name === "query") {
      const sql = request.params.arguments?.sql as string;

      const client = await pool.connect();
      try {
        await client.query("BEGIN TRANSACTION READ ONLY");
        const result = await client.query(sql);
        return {
          content: [
            { type: "text", text: JSON.stringify(result.rows, null, 2) },
          ],
          isError: false,
        };
      } catch (error) {
        throw error;
      } finally {
        client
          .query("ROLLBACK")
          .catch((error) =>
            console.warn("Could not roll back transaction:", error)
          );

        client.release();
      }
    }
    throw new Error(`Unknown tool: ${request.params.name}`);
  });

  async function runServer() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
  }

  runServer().catch((error) => {
    console.error("Server error:", error);
    process.exit(1);
  });
} catch (error: unknown) {
  if (error instanceof Error) {
    console.error("Configuration error:", error.message);
  } else {
    console.error("Configuration error:", error);
  }
  process.exit(1);
}
