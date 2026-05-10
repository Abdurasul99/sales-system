# Backend

Express + TypeScript + Prisma backend for the rebuilt Sales System.

## Stack

- Node.js
- Express.js
- Prisma
- PostgreSQL
- Vitest

## Quick Start

```bash
cp .env.example .env
createdb sales_system_backend || true
npm install
npm run db:push
npm run db:seed
npm run dev
```

## Demo Login

- Login: `owner`
- Password: `Owner123!`

## Core API Areas

- `/api/auth`
- `/api/users`
- `/api/products`
- `/api/customers`
- `/api/suppliers`
- `/api/warehouses`
- `/api/inventory`
- `/api/sales`
- `/api/purchases`
- `/api/analytics`

## Notes

- When `../flutter_app/build/web` exists, the backend serves the Flutter web bundle from `/`.
- API remains available under `/api/*`.
