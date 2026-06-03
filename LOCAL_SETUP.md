# Lawncare Workshop - Local Development Setup

Complete guide to run this application locally with your own PostgreSQL database.

## Prerequisites

- **Node.js** v20+ (https://nodejs.org/)
- **PostgreSQL** v14+ (https://www.postgresql.org/download/)
- **npm** (comes with Node.js)

## 1. Clone & Install

```bash
git clone <your-repo-url>
cd lawncare-workshop
npm install
```

## 2. Set Up PostgreSQL Database

### Create a local database:

**macOS (Homebrew):**
```bash
brew services start postgresql
```

**Ubuntu/Debian:**
```bash
sudo service postgresql start
```

**Windows:**
Start PostgreSQL from Services or pgAdmin.

Then create the database:
```bash
psql -U postgres

CREATE DATABASE lawncare_workshop;
\q
```

## 3. Environment Variables

Create a `.env` file in the project root:

```env
# Database - Local PostgreSQL
DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/lawncare_workshop

# Authentication (generate a random secret)
JWT_SECRET=your-secret-key-here-change-in-production
```

Generate a secure JWT_SECRET:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Optional Variables (for push notifications):
```env
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=your-client-email
FIREBASE_PRIVATE_KEY=your-private-key
VAPID_PUBLIC_KEY=your-vapid-public-key
VAPID_PRIVATE_KEY=your-vapid-private-key
```

## 4. Initialize the Database

```bash
# Create all tables from schema
npm run db:push

# Seed with initial data (admin user, sample content)
npm run db:seed
```

This creates:
- Admin user: admin@lawncareworkshop.com / admin123
- Sample grass types, video lessons, care plans, deals, testimonials, FAQs, blog posts, site settings, and a sample competition

## 5. Run the Application

### Development mode:
```bash
npm run dev
```
- Frontend: http://localhost:5000
- Backend API: http://localhost:5000/api

### Production mode:
```bash
npm run build
npm start
```

## Database Scripts

| Command | Description |
|---------|-------------|
| `npm run db:push` | Create/update tables from schema |
| `npm run db:seed` | Seed database with initial data (only if empty) |
| `npm run db:generate` | Generate SQL migration files from schema changes |
| `npm run db:migrate` | Run pending migration files |
| `npm run db:studio` | Open Drizzle Studio (visual database browser) |

## Project Structure

```
├── client/                 # Frontend (React + Vite + TypeScript)
│   └── src/
│       ├── components/     # UI components
│       ├── pages/          # Page components
│       ├── hooks/          # Custom React hooks
│       └── lib/            # Utilities and API client
├── server/                 # Backend (Express + TypeScript)
│   ├── index.ts            # Server entry point
│   ├── routes.ts           # API route handlers
│   ├── auth.ts             # Authentication middleware
│   ├── db.ts               # Database connection (universal PostgreSQL)
│   ├── seed.ts             # Database seeding logic
│   ├── runSeed.ts          # Standalone seed runner
│   ├── dbMigrations.ts     # Runtime schema migrations
│   └── firebase.ts         # Firebase push notifications
├── shared/
│   └── schema.ts           # Database schema (Drizzle ORM)
├── drizzle.config.ts       # Drizzle Kit configuration
└── package.json
```

## Database Compatibility

The application uses a universal PostgreSQL driver. Set `DATABASE_URL` to any PostgreSQL-compatible database:

- **Local PostgreSQL** - `postgresql://user:password@localhost:5432/dbname`
- **Neon** - `postgresql://user:password@host.neon.tech/dbname?sslmode=require`
- **Supabase** - `postgresql://user:password@host.supabase.co:5432/postgres`
- **Railway** - Use the provided `DATABASE_URL`
- **Render** - Use the provided database URL
- **AWS RDS** - `postgresql://user:password@host.rds.amazonaws.com:5432/dbname`

## Admin Panel

Access at `/admin/login`:
- Email: `admin@lawncareworkshop.com`
- Password: `admin123`

Change the password after first login via My Profile in the admin sidebar.

## Development Workflow for Schema Changes

```bash
# 1. Edit shared/schema.ts
# 2. Push changes to database
npm run db:push

# Or generate migration files first
npm run db:generate
npm run db:migrate
```

## Troubleshooting

**"DATABASE_URL must be set"** - Create a `.env` file with your database connection string.

**"relation does not exist"** - Run `npm run db:push` to create tables.

**"ECONNREFUSED"** - Check PostgreSQL is running: `pg_isready`

**Port 5000 already in use** - Kill the process: `npx kill-port 5000`

**Empty database after seeding** - The seed only runs if the users table is empty. To re-seed, clear the users table first or run `npm run db:reset` then `npm run db:seed`.
