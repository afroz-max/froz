# FROZ

FROZ is a PostgreSQL-backed platform for finding nearby professionals and sending
collaboration requests.

## Local Setup

Prerequisites: Node.js, npm, and PostgreSQL.

Create the database and PostgreSQL user access:

```sql
CREATE DATABASE froz_db;
```

Install dependencies:

```bash
npm install
```

Copy `.env.example` to `.env` and set both required values. `DATABASE_URL` must
point to PostgreSQL; for the local instance described by this project it uses
port `5434`:

```dotenv
DATABASE_URL=postgresql://postgres:<password>@localhost:5434/froz_db
JWT_SECRET=<long-random-secret>
```

Start FROZ:

```bash
npm run dev
```

The server creates the required PostgreSQL tables on startup. To check persistence,
register an account, create a profile, stop the server, start it again, and log
back in to confirm the profile remains. Use two separate accounts to verify that
one account can send a request, the profile owner can accept or decline it, and
neither account can modify the other account's profile.
