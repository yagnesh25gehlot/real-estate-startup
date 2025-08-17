-- Create admin user with the correct email address
-- Email: bussiness.startup.work@gmail.com
-- Password: Nikku@25

-- First, check if admin user already exists
SELECT 'Checking for existing admin user...' as status;
SELECT id, email, name, role FROM "User" WHERE email = 'bussiness.startup.work@gmail.com';

-- Create admin user with the correct email
INSERT INTO "User" ("id", "email", "name", "password", "role", "status", "createdAt") 
VALUES (
    gen_random_uuid(),
    'bussiness.startup.work@gmail.com',
    'Business Admin',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/8KqKqKq', -- bcrypt hash for 'Nikku@25'
    'ADMIN',
    'ACTIVE',
    CURRENT_TIMESTAMP
) ON CONFLICT ("email") DO NOTHING;

-- Verify admin user was created
SELECT 'Admin user created/verified:' as status;
SELECT id, email, name, role, status FROM "User" WHERE email = 'bussiness.startup.work@gmail.com';

-- Also check for any other admin users
SELECT 'All admin users in database:' as status;
SELECT id, email, name, role, status FROM "User" WHERE role = 'ADMIN';
