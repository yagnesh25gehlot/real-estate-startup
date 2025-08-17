-- Create admin user with secure password
-- This script adds the admin user that should exist for the application to work

-- First, check if admin user already exists
SELECT 'Checking for existing admin user...' as status;

-- Check if admin user exists
SELECT id, email, name, role FROM "User" WHERE email = 'bussinessstatupwork@gmail.com';

-- If no admin user exists, create one
INSERT INTO "User" ("id", "email", "name", "password", "role", "status", "createdAt") 
VALUES (
    gen_random_uuid(),
    'bussinessstatupwork@gmail.com',
    'Business Admin',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/8KqKqKq', -- This is a bcrypt hash for 'Nikku@25'
    'ADMIN',
    'ACTIVE',
    CURRENT_TIMESTAMP
) ON CONFLICT ("email") DO NOTHING;

-- Verify admin user was created
SELECT 'Admin user created/verified:' as status;
SELECT id, email, name, role, status FROM "User" WHERE email = 'bussinessstatupwork@gmail.com';
