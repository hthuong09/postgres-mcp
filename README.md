# MCP PostgreSQL Server

This is a Model Context Protocol server for interacting with PostgreSQL databases. It provides a read-only interface to query PostgreSQL databases and inspect their schema.

## Installation

```bash
npm install -g @hthuong09/postgres-mcp
```

## Configuration

The server can be configured in multiple ways, listed in order of priority:

1. **Environment Variables**
   - `POSTGRES_URL`: Full database URL (e.g., `postgres://user:pass@host:5432/dbname`)
   - Individual connection parameters:
     - `POSTGRES_HOST`: Database host
     - `POSTGRES_PORT`: Database port (default: 5432)
     - `POSTGRES_DB`: Database name
     - `POSTGRES_USER`: Database user
     - `POSTGRES_PASSWORD`: Database password
     - `POSTGRES_SSL`: Enable SSL mode (set to 'true' to enable)
     - `POSTGRES_SCHEMA`: Database schema (default: 'public')
   - Additional configuration:
     - `DOTENV_PATH`: Custom path to .env file
     - `DEBUG_MCP`: Enable debug logging (set to 'true' to enable)

2. **Command Line**
   ```bash
   npx @hthuong09/postgres-mcp "postgres://user:pass@host:5432/dbname"
   ```

### Resources

- Table schemas: Each table in the database is exposed as a resource
- Resource URI format: `postgres://user@host/dbname/table_name/schema`
- Response format: JSON array of column definitions (name and data type)

## Usage Examples

1. Using environment variables:
   ```bash
   export POSTGRES_HOST=localhost
   export POSTGRES_DB=mydb
   export POSTGRES_USER=myuser
   export POSTGRES_PASSWORD=mypassword
   npx @hthuong09/postgres-mcp
   ```

2. Using a connection URL:
   ```bash
   npx @hthuong09/postgres-mcp "postgres://myuser:mypassword@localhost:5432/mydb"
   ```

3. Using environment variables with SSL:
   ```bash
   export POSTGRES_HOST=db.example.com
   export POSTGRES_DB=mydb
   export POSTGRES_USER=myuser
   export POSTGRES_PASSWORD=mypassword
   export POSTGRES_SSL=true
   npx @hthuong09/postgres-mcp
   ```

4. Using a custom .env file location:
   ```bash
   DOTENV_PATH=/path/to/.env npx @hthuong09/postgres-mcp
   ```

## Security Considerations

- Database credentials should be kept secure
- Use environment variables or .env files instead of command line arguments in production to avoid exposing credentials in process lists
- Consider using SSL in production environments
- The server only allows read-only transactions for safety
- Passwords are automatically stripped from resource URIs

## Development

To build the server locally:

```bash
npm install
npm run build
```

To run in watch mode during development:

```bash
npm run watch
```

## Debugging

Set `DEBUG_MCP=true` to enable debug logging. Logs will be written to:
- Unix/macOS: `/tmp/postgres-mcp-debug.json`
- Windows: `%TEMP%/postgres-mcp-debug.json`

## License

MIT
