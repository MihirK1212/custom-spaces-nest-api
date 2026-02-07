# Custom Spaces Nest API

A NestJS-based backend API for Custom Spaces, providing customizable widgets and user management functionality.

## Getting Started

### Prerequisites

- Node.js
- pnpm
- PostgreSQL
- MongoDB

### Setup

1. **Set Environment Variables**

Create a `.env` file in the root directory with the following variables:

```
SQL_DB_HOST="localhost"
SQL_DB_PORT=5432
SQL_DB_USERNAME="postgres"
SQL_DB_PASSWORD="<sql_db_password>"
MONGO_DB_URL="mongodb://localhost/custom-spaces"
JWT_SECRET_KEY="<jwt_secret_key>"
WATCHPACK_POLLING=true
```

2. **Install Dependencies**

```bash
pnpm install
```

3. **Start Development Server**

```bash
pnpm run start:dev
```
