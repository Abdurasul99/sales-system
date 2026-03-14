List and explore all N8N workflows in the local instance.

## Instructions

### Step 1 — Fetch all workflows
Use `n8n_list_workflows` to retrieve every workflow. Display them as a clean table with:
- ID
- Name
- Active status (✓ active / ✗ inactive)

Group them by category prefix (e.g. all `Sales - *` workflows together).

### Step 2 — Offer next actions
After listing, ask the user what they'd like to do:
1. **Inspect a workflow** — fetch its full definition with `n8n_get_workflow` and explain what each node does in plain English
2. **Check recent executions** — use `n8n_list_executions` to show run history and success/failure rate
3. **Edit a workflow** — load the workflow and make requested changes with `n8n_update_workflow`
4. **Delete a workflow** — confirm with the user before calling `n8n_delete_workflow`
5. **Activate / Deactivate** — toggle with `n8n_activate_workflow` or `n8n_deactivate_workflow`
6. **Build a new workflow** — redirect to `/build-n8n-workflow`

### Tips
- If there are many workflows, summarize counts by category
- Flag any workflows that have been failing recently (use execution data if available)
- Note any workflows with no recent executions that might be stale
