# Node Js PostgreSql Apis
Node Js PostgresSql Database for small Retail System

# 1. Install dependencies
- cd retail-api && npm install

# 2. Copy and fill in your .env
- cp .env.example .env

# 3. Create DB and run schema
- psql -U postgres -c "CREATE DATABASE retail_db;"
- psql -U postgres -d retail_db -f src/db/schema.sql

# 4. Start the server
- npm run dev

- When server runs in your terminal, You can see the port and link to open and  visit http://localhost:3000/api-docs for the interactive Swagger UI.

- I created Sample data so seeded Admin Account is:
    - Email:    admin@retail.com
    - Password: Admin@123