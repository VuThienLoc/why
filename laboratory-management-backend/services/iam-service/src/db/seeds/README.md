# Database Seeding

This directory contains seed files to populate the database with initial data.

## Seed Files

### 1. `001_roles.seed.ts` - System Roles
Creates the default system roles with their privileges:

- **ADMIN** - Full system access (17 privileges)
  - All test order operations
  - All comment operations
  - All configuration operations
  - All user management operations
  - All role management operations
  - System admin privilege

- **MANAGER** - User and role management (8 privileges)
  - All user management operations
  - All role management operations

- **SERVICE** - Configuration management (4 privileges)
  - All configuration operations

- **LAB_USER** - Laboratory operations (7 privileges)
  - All test order operations
  - All comment operations

- **USER** - Basic read access (1 privilege)
  - Read test orders only

### 2. `002_users.seed.ts` - Sample Users
Creates sample users for each role:

| Email | Role | Password | Identity Number |
|-------|------|----------|----------------|
| admin@example.com | ADMIN | admin123 | ADMIN001 |
| manager@example.com | MANAGER | manager123 | MGR001 |
| service@example.com | SERVICE | service123 | SVC001 |
| labuser@example.com | LAB_USER | labuser123 | LAB001 |
| user1@example.com | USER | user123 | USER001 |
| user2@example.com | USER | user123 | USER002 |

## Running Seeds

### Run All Seeds (Recommended)
```bash
npm run seed
```

### Run Individual Seeds
```bash
# Seed roles first
npm run seed:roles

# Then seed users
npm run seed:users
```

### Run from TypeScript directly
```bash
# All seeds
tsx src/db/seeds/seed.ts

# Individual seeds
tsx src/db/seeds/001_roles.seed.ts
tsx src/db/seeds/002_users.seed.ts
```

## Important Notes

1. **Order Matters**: Always run `001_roles.seed.ts` before `002_users.seed.ts` because users reference role IDs.

2. **Idempotent**: Seeds are designed to be idempotent:
   - Roles: Updates existing roles with current privileges
   - Users: Skips if user already exists

3. **Environment**: Make sure your `.env` file is configured with the correct MongoDB connection string.

4. **Production**: Never run seeds in production with default passwords!

## Customization

To add more users or modify roles:

1. Edit the seed data arrays in the respective files
2. Run the seeds again
3. Existing data will be preserved (users) or updated (roles)

## Troubleshooting

### "No roles found" error
Run `001_roles.seed.ts` first before running `002_users.seed.ts`.

### Duplicate key error
A user with the same email or identity number already exists. Either:
- Delete the existing user
- Change the email/identity number in the seed data

### Connection error
Check your `.env` file and ensure MongoDB is running.
