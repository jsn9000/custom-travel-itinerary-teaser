# Supabase MCP Server Setup

This project uses the Supabase MCP (Model Context Protocol) server to enable AI assistants like Claude Code to interact directly with your Supabase database.

## What is MCP?

Model Context Protocol (MCP) is a standard for connecting Large Language Models (LLMs) to platforms like Supabase. Once connected, AI assistants can:
- Query your database using natural language
- Create and manage tables
- Generate migrations
- Run SQL queries and reports
- Manage schema and TypeScript types

## Configuration

The MCP server is configured in `.mcp.json`:

```json
{
  "mcpServers": {
    "supabase": {
      "type": "http",
      "url": "https://mcp.supabase.com/mcp?read_only=false&project_ref=eaofdajkpqyddlbawdli"
    }
  }
}
```

### Configuration Options

You can customize the URL with these query parameters:

- `read_only=true` - Enable read-only mode for safer operations
- `project_ref=<id>` - Scope access to a specific Supabase project
- `features=database,docs` - Limit available tools

Example with read-only mode:
```json
"url": "https://mcp.supabase.com/mcp?read_only=true&project_ref=eaofdajkpqyddlbawdli"
```

## Authentication

### First-Time Setup

When you first use the MCP server in Claude Code:

1. Claude Code will prompt you to authenticate
2. A browser window will open for OAuth login
3. Log into your Supabase account
4. Select the organization containing your project
5. Grant access to the MCP server

Authentication tokens are stored securely and auto-refreshed.

### Manual Authentication (CI/CD)

For CI/CD environments without browser access:

1. Generate a personal access token from [Supabase Dashboard > Account > Access Tokens](https://supabase.com/dashboard/account/tokens)
2. Add it to your `.mcp.json`:

```json
{
  "mcpServers": {
    "supabase": {
      "type": "http",
      "url": "https://mcp.supabase.com/mcp?project_ref=eaofdajkpqyddlbawdli",
      "headers": {
        "Authorization": "Bearer ${SUPABASE_ACCESS_TOKEN}"
      }
    }
  }
}
```

3. Set the `SUPABASE_ACCESS_TOKEN` environment variable

## Security Considerations

⚠️ **IMPORTANT**: The Supabase MCP server is designed for **development and testing only**. Never connect it to production data.

### Three-Tier Safety System

Operations are categorized as:
- **Safe** - Read operations, schema inspection
- **Write** - Data modifications, table creation
- **Destructive** - Table drops, data deletion

### Best Practices

1. **Use read-only mode** when exploring data: `read_only=true`
2. **Scope to specific projects** using `project_ref`
3. **Never commit** `.mcp.json.local` (contains OAuth tokens)
4. **Use branches** for testing schema changes
5. **Keep separate projects** for development and production

## Available Capabilities

Once configured, you can ask Claude Code to:

- "Show me all tables in the database"
- "Create a new table for storing user preferences"
- "Query all trips created in the last 7 days"
- "Generate a migration to add an email column"
- "Show me the schema for the trips table"
- "Run a report on hotel bookings by city"

## Troubleshooting

### Authentication Issues

If authentication fails:
1. Check that you're logged into the correct Supabase account
2. Ensure you have access to the project
3. Try regenerating your access token if using manual auth

### Connection Issues

If the MCP server can't connect:
1. Verify your project ref is correct: `eaofdajkpqyddlbawdli`
2. Check that the project exists and is accessible
3. Ensure your internet connection is stable

### Permission Issues

If operations are blocked:
1. Check if read-only mode is enabled
2. Verify your Supabase account has the necessary permissions
3. Ensure the project is in the correct organization

## Resources

- [Supabase MCP Documentation](https://supabase.com/docs/guides/getting-started/mcp)
- [MCP Server Features](https://supabase.com/features/mcp-server)
- [Claude Code MCP Guide](https://docs.claude.com/en/docs/claude-code/mcp.md)
- [GitHub Repository](https://github.com/supabase-community/supabase-mcp)

## Project Information

- **Supabase Project**: `eaofdajkpqyddlbawdli`
- **Project URL**: https://eaofdajkpqyddlbawdli.supabase.co
- **MCP Server**: https://mcp.supabase.com/mcp
