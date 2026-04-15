Build a new N8N workflow from a plain-English description and deploy it to the local N8N instance.

## Instructions

Follow these steps every time:

### Step 1 — Clarify requirements
Ask the user the following if not already provided:
- What triggers the workflow? (webhook, schedule, manual, another workflow)
- What data comes in / what's the input?
- What should the workflow do with that data? (enrich, filter, transform)
- Where does the output go? (CRM, email, Slack, Google Sheets, etc.)
- Any specific APIs or credentials needed?

### Step 2 — Check for existing workflows
Use `n8n_list_workflows` to check whether a similar workflow already exists. If one does, ask the user if they want to modify it instead of creating a new one.

### Step 3 — Design the node graph
Think through the node sequence before writing JSON:
- Name the workflow: `[Category] - [Action]` (e.g. `Sales - Lead Enrichment`)
- Map each step to a specific N8N node type
- Plan the error handling branch
- Identify which credentials are needed

### Step 4 — Create the workflow
Use `n8n_create_workflow` with a complete, valid N8N workflow JSON. The JSON must include:
- `name` — following naming convention
- `nodes` — array of all nodes with `id`, `name`, `type`, `typeVersion`, `position`, `parameters`
- `connections` — wiring between nodes
- `settings` — set `executionOrder: "v1"` and `saveManualExecutions: true`
- `tags` — include relevant tags (e.g. `["sales", "automation"]`)

### Step 5 — Test the workflow
Use `n8n_execute_workflow` to trigger a test run. Then use `n8n_get_execution` to check the result. If any node failed, fix it with `n8n_update_workflow` and retest.

### Step 6 — Activate (if requested)
If the user confirms the workflow works correctly, use `n8n_activate_workflow` to enable it.

## Key Rules
- Never hardcode API keys or secrets in node parameters — always reference N8N credentials by name
- Always add an error handling node or branch
- Keep node positions organized (left to right, spaced 200px apart horizontally)
- After creating, show the user the N8N URL to view it: `http://localhost:5678/workflow/{id}`
