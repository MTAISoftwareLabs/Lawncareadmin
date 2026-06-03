---
name: postgres-js db.execute() return shape
description: Why raw db.execute() results must be treated as arrays, not { rows: [...] }, after the postgres-js driver migration.
---

# postgres-js `db.execute()` returns an array, not `{ rows: [...] }`

With the `drizzle-orm/postgres-js` driver, `await db.execute(sql\`...\`)` resolves
to the result **rows as a direct array**. The old neon/pg-style `result.rows[0]`
access yields `undefined` (or throws when chained), NOT the first row.

**Why:** The project migrated DB drivers; code written for the previous driver
still used `.rows`. The most damaging case was a `SELECT ... as exists` table
check inside `initializeFirebase()` (`tableCheck.rows[0]?.exists`) — it threw a
TypeError that the outer try/catch swallowed, so Firebase *always* reported
"not configured" before it ever read the saved service account. That produced
a user-facing "push notifications don't work / Firebase not configured" bug even
with valid credentials uploaded.

**How to apply:** When using raw `db.execute()`, index the result directly
(`(result as any)[0]` / `Array.from(result as any)`), never `result.rows`. After
any DB-driver migration, grep the whole repo for `.rows` on execute results
(routes, scripts, server) — there were several scattered occurrences.

## Related: Firebase admin re-init gotcha
`firebase-admin` `initializeFirebase()` early-returns when `admin.apps.length > 0`,
so uploading a *new* service account after a successful init won't reload it.
Use a `reinitializeFirebase()` that does `admin.apps.map(a => a.delete())` then
re-inits, and call it from the save endpoints. Surface the specific reason to the
admin via a `getLastFirebaseError()` accessor instead of a generic message.
