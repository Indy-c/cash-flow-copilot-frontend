# Cash Flow Copilot Frontend

React dashboard for the Cash Flow Copilot project. The app lets small-business users upload transaction CSV files, review imported transactions, reset test data, and see basic cash-flow summary metrics.

## Features

- CSV transaction upload through the FastAPI backend
- Transaction table with date, description, amount, and category
- Dashboard summary cards for income, expenses, net cash flow, and transaction count
- Reset action for clearing imported transactions during development
- Responsive layout for desktop and smaller screens

## Tech Stack

- React
- TypeScript
- Vite
- Axios

## Getting Started

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

The frontend expects the backend API to run at:

```text
http://localhost:8000
```

## Backend Pairing

This frontend works with the Cash Flow Copilot backend API:

```text
GET    /api/transactions
GET    /api/transactions/summary
GET    /api/transactions/categories
POST   /api/transactions/upload
DELETE /api/transactions
```

## CSV Format

Use a CSV with these columns:

```csv
date,description,amount,category
2026-01-01,Salary,35000,Income
2026-01-02,7-Eleven,-120,Food
```

Positive amounts are treated as income. Negative amounts are treated as expenses.

## Scripts

```bash
npm run dev
npm run build
npm run lint
npm run preview
```
