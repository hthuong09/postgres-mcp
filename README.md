# MCP PostgreSQL Server

This is a Model Context Protocol server for interacting with PostgreSQL databases.

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

2. **Command Line**
   ```bash
   mcp-server-postgres "postgres://user:pass@host:5432/dbname"
   ```

## Usage Examples

1. Using environment variables:
   ```bash
   export POSTGRES_HOST=localhost
   export POSTGRES_DB=mydb
   export POSTGRES_USER=myuser
   export POSTGRES_PASSWORD=mypassword
   mcp-server-postgres
   ```

2. Using a connection URL:
   ```bash
   mcp-server-postgres "postgres://myuser:mypassword@localhost:5432/mydb"
   ```

3. Using environment variables with SSL:
   ```bash
   export POSTGRES_HOST=db.example.com
   export POSTGRES_DB=mydb
   export POSTGRES_USER=myuser
   export POSTGRES_PASSWORD=mypassword
   export POSTGRES_SSL=true
   mcp-server-postgres
   ```

## Features

The server provides the following capabilities:

- List available database tables
- Retrieve table schemas
- Execute read-only SQL queries

## Security Considerations

- Database credentials should be kept secure
- Use environment variables instead of command line arguments in production to avoid exposing credentials in process lists
- Consider using SSL in production environments
- The server only allows read-only transactions

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

## License

MIT
