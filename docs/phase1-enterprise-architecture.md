# Phase 1 Enterprise Architecture

## Scope

Phase 1 covers the operational kernel:

- master data
- roles and permissions
- products
- customers
- suppliers
- warehouses
- currencies and exchange rates
- stock ledger
- purchase orders
- sales orders
- returns
- dashboard

## Backend Domain Boundaries

- `auth`: bootstrap, login, token context
- `iam`: role catalog, permission templates, role CRUD
- `master-data`: categories, units, customer segments, currencies, exchange rates, storage locations, product attributes
- `products`: product catalog and price history
- `customers`: customer master and interaction history
- `suppliers`: supplier master and supplier basics
- `warehouses`: warehouse master and warehouse inventory view
- `inventory`: stock balances and movement ledger
- `purchases`: purchase order lifecycle and stock receipt posting
- `sales`: lead -> deal -> sales order flow and stock issue posting
- `returns`: customer return intake and refund/stock posting
- `analytics`: operational dashboard and replenishment views

## Posting Principles

- Inventory is posted only through the movement ledger.
- Sales issue stock and create finance income entries.
- Purchases receive stock and create finance expense entries.
- Returns receive stock back and create refund expense entries.
- All posting flows run inside transactions.
- Movement and ledger records capture the actor where available.

## Database Principles

- PostgreSQL normalized schema
- tenant-aware tables via `organizationId`
- composite unique keys for business codes
- historical price records
- separate exchange rate table
- optional archival fields for master entities
- audit log for mutations

## API Surface

- `/api/auth/*`
- `/api/iam/*`
- `/api/master-data/*`
- `/api/users/*`
- `/api/products/*`
- `/api/customers/*`
- `/api/suppliers/*`
- `/api/warehouses/*`
- `/api/inventory/*`
- `/api/sales/*`
- `/api/sales-orders/*`
- `/api/purchases/*`
- `/api/purchase-orders/*`
- `/api/returns/*`
- `/api/return-orders/*`
- `/api/analytics/*`

## Flutter Features

- `auth`
- `dashboard`
- `master_data`
- `products`
- `customers`
- `suppliers`
- `inventory`
- `sales_orders`
- `purchase_orders`
- `return_orders`

Each feature follows `binding -> controller -> view` with repositories and API providers separated in `data/`.
