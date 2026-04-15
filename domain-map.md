# Domain Map

## Canonical Application

`saas/` is the canonical ERP platform application.

## Current Core Domains

- Identity and Access
  - organizations
  - branches
  - users
  - roles
  - permissions
- Catalog
  - products
  - categories
  - pricing inputs
- Inventory
  - stock levels
  - reservations
  - inventory movements
  - warehouse intelligence
- Procurement
  - suppliers
  - purchases
  - receiving
- Sales
  - sales
  - sale items
  - payments
  - returns
  - cashier shifts
- CRM
  - customers
  - contact and debt context
- Finance
  - expenses
  - income
  - currencies
  - exchange rates
- Oversight
  - notifications
  - audit logs
  - analytics and reporting

## Repository Boundaries

- `saas/`
  - product runtime
  - UI
  - route handlers
  - Prisma schema and migrations
  - verification scripts
- `automation/`
  - isolated workflow automation assets
  - Claude/N8N materials
  - not authoritative for product architecture
