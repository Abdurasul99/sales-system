# Sales System — N8N Workflow Builder

## Project Purpose

This project uses Claude Code to build, manage, and deploy N8N workflows for sales automation — entirely through prompting. Claude uses the N8N MCP server to talk directly to the local N8N instance and skills (slash commands) to follow best practices when building workflows.

---

## N8N Instance

- **URL**: `http://localhost:5678`
- **API Key**: Set in `.mcp.json` (never hardcode in workflow nodes)

To get your API key: N8N UI → Settings → n8n API → Create API Key

---

## Repos

| Repo | Path | Purpose |
|---|---|---|
| [n8n-sales](https://github.com/Abdurasul99/n8n-sales) | `.claude/commands/` | Claude Code skills (slash commands) for building N8N workflows |
| [n8n-mcp](https://github.com/Abdurasul99/n8n-mcp) | `N8N/n8n-mcp/` | Custom MCP server — connects Claude to the local N8N instance |

---

## MCP Tools Available

The `n8n` MCP server (configured in `.mcp.json`) exposes these tools. Use them directly when building or inspecting workflows:

| Tool | Purpose |
|---|---|
| `n8n_list_workflows` | List all workflows (id, name, active status) |
| `n8n_get_workflow` | Fetch full workflow JSON by ID |
| `n8n_create_workflow` | Create a new workflow from JSON |
| `n8n_update_workflow` | Update an existing workflow by ID |
| `n8n_delete_workflow` | Delete a workflow by ID |
| `n8n_activate_workflow` | Set a workflow to active |
| `n8n_deactivate_workflow` | Set a workflow to inactive |
| `n8n_execute_workflow` | Manually trigger a workflow execution |
| `n8n_get_execution` | Fetch execution results/logs by execution ID |
| `n8n_list_executions` | List recent executions for a workflow |

Always use `n8n_list_workflows` first to avoid duplicating existing workflows before creating a new one.

---

## Skills (Slash Commands)

Invoke these in Claude Code to get structured help:

| Command | Purpose |
|---|---|
| `/build-n8n-workflow` | Build and deploy a new workflow from a plain-English description |
| `/debug-n8n-workflow` | Debug a failing workflow using execution logs |
| `/list-n8n-workflows` | List and explore all workflows in the N8N instance |

---

## Workflow Building Conventions

### Naming
Always use the format: `[Category] - [Action]`
- `Sales - Lead Enrichment`
- `Sales - Outreach Sequence`
- `Sales - CRM Sync`

### Structure Pattern (Sales Automation)
```
Trigger (Webhook / Schedule / Manual)
  → Validate / Filter input
  → Enrich data (HTTP Request / API calls)
  → Process / Transform (Code / Set nodes)
  → Update CRM
  → Notify (Email / Slack)
  → Error Handler branch
```

### Rules
- **Never hardcode API keys** in nodes — always reference N8N credentials store
- **Always add an Error Trigger** node or error branch on critical workflows
- **Test before activating** — use `n8n_execute_workflow` to run a test, then `n8n_activate_workflow`
- **Tag workflows** by category (e.g., `sales`, `enrichment`, `outreach`) for easier filtering

### Common N8N Node Types for Sales
- `n8n-nodes-base.webhook` — inbound HTTP trigger
- `n8n-nodes-base.scheduleTrigger` — time-based trigger
- `n8n-nodes-base.httpRequest` — call any external API
- `n8n-nodes-base.code` — JavaScript transformations
- `n8n-nodes-base.set` — map/rename fields
- `n8n-nodes-base.if` — conditional branching
- `n8n-nodes-base.emailSend` — send emails
- `n8n-nodes-base.slack` — Slack notifications
- `n8n-nodes-base.airtable` — Airtable CRM
- `n8n-nodes-base.googleSheets` — Google Sheets as lightweight CRM

---

## Working Process

When a user describes a workflow to build:
1. Check existing workflows with `n8n_list_workflows`
2. Clarify trigger, inputs, outputs, and any APIs involved
3. Design the node graph mentally before writing JSON
4. Create with `n8n_create_workflow`
5. Test with `n8n_execute_workflow`
6. Fix any issues with `n8n_update_workflow`
7. Activate with `n8n_activate_workflow` once confirmed working
