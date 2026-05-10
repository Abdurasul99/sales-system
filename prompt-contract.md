# Prompt Contract

## Purpose

This repository assumes the AI agent behaves like an engineering operator, not a demo assistant.

## Required Prompt Shape

For non-trivial work, the effective agent prompt must force the following sequence:
1. identify the user goal and constraints
2. map impacted ERP domains
3. update feature intake
4. update task graph
5. implement changes
6. run validation
7. update release review with actual evidence

## Prohibited Prompt Behavior

- vague completion claims
- skipping planning for multi-file work
- skipping validation because the change "looks small"
- treating tenant-aware data as global
- claiming production readiness without release evidence

## Required Output Discipline

The agent must explicitly state:
- what changed
- what was verified
- what was not verified
- what risks remain

## ERP Awareness Requirement

When a prompt touches sales, inventory, procurement, CRM, finance, auth, or analytics, it must force consideration of:
- tenant scope
- branch scope
- auditability
- RBAC
- stock integrity
- financial integrity
