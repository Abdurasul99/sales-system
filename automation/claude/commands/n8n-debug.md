Debug a failing N8N workflow by fetching its definition and execution logs, then fix the issue.

## Instructions

### Step 1 — Identify the workflow
If the user hasn't specified which workflow:
- Use `n8n_list_workflows` to show all workflows
- Ask the user which one is failing

### Step 2 — Fetch the workflow definition
Use `n8n_get_workflow` with the workflow ID to get the full node/connection structure. Review:
- Node types and their parameters
- Connection wiring (are all nodes connected correctly?)
- Credentials referenced (do they exist in N8N?)

### Step 3 — Fetch recent execution logs
Use `n8n_list_executions` to get recent execution IDs, then `n8n_get_execution` on the most recent failed one. Look for:
- Which node failed (check `status` per node in the execution data)
- The exact error message
- What input data the failing node received
- What output was expected

### Step 4 — Diagnose the root cause
Common failure patterns:
- **Credential error** — wrong credential name or expired token
- **HTTP 4xx/5xx** — bad API parameters or auth issue in HTTP Request node
- **JSON parse error** — malformed data from a previous node
- **Missing field** — a node references a field that doesn't exist in the input
- **Code node error** — JavaScript syntax or runtime error
- **Webhook not reachable** — N8N not accessible from external source

### Step 5 — Fix and redeploy
Use `n8n_update_workflow` with the corrected workflow JSON. Then:
- Use `n8n_execute_workflow` to retest
- Use `n8n_get_execution` to confirm it passed
- Report the fix to the user with a clear explanation of what was wrong and what was changed
