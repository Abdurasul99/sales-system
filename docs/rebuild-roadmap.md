# Sales System Rebuild Roadmap

## Context

The existing `saas/` project contains useful domain ideas, but it does not match the requested target stack:

- Backend: `Node.js + Express.js`
- Frontend: `Flutter` with `MVVM + GetX`
- RBAC by user role
- Responsive experience on every screen
- Test-driven implementation
- Demo-ready public access for investors and pilot users

To avoid breaking the current codebase, the rebuild is introduced side-by-side:

- `saas/` - legacy reference implementation
- `backend/` - new API and domain core
- `flutter_app/` - new Flutter client

## Product Scope

The full specification is ERP-class and should be split into delivery waves. The rebuild targets a production-minded MVP core first, with data structures that do not block later expansion.

### Wave 1: Operational Core

- Multi-company / branch / warehouse structure
- Users, roles, permissions, audit trail
- Products, categories, units, suppliers, customers, currencies
- Sales pipeline: lead -> deal -> sales order
- Purchase orders and receiving
- Real-time inventory balances and movements
- Returns, reservations, stock adjustments
- Finance ledger events for core operations
- Analytics basics: dashboard, ABC, reorder point, EOQ, dead stock flags

### Wave 2: Management Layer

- RFM segmentation
- Plan vs fact sales
- Supplier scorecards
- Customer communication history
- KPI dashboards
- Margin and product profitability
- Cash flow and P&L views
- Approval workflows and notifications

### Wave 3: Decision Support

- Demand forecasting
- Scenario modeling
- Smart replenishment recommendations
- Risk alerts
- Automated tasking and Telegram owner bot

## Design Principles

- Keep every business record tenant-aware.
- Validate at the edge with strict schemas.
- Store audit events for every mutation.
- Prefer append-only movement/ledger history over destructive updates.
- Separate domain calculations into pure services with tests.
- Seed realistic demo data so the system is showable early.

## Role Model

Default system roles planned for the rebuild:

- `OWNER`
- `GENERAL_MANAGER`
- `SALES_MANAGER`
- `PROCUREMENT_MANAGER`
- `WAREHOUSE_MANAGER`
- `FINANCE_MANAGER`
- `ACCOUNTANT`
- `OPERATOR`
- `VIEWER`

Each role maps to explicit permissions so RBAC can be customized later per tenant.

## Immediate Deliverables In This Rebuild Pass

- New Express backend foundation
- PostgreSQL Prisma schema for core modules
- Authentication and RBAC middleware
- CRUD and workflow endpoints for master data, inventory, sales, purchases, and analytics
- Vitest coverage for critical business rules
- Flutter MVVM/GetX application shell with the first module screens
- Local demo seed and public demo exposure via a temporary cloud tunnel
