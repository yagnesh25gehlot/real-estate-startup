-- Add test data to verify the application works

-- Add a test user
INSERT INTO "User" ("id", "email", "name", "password", "role", "status") VALUES 
('test-user-1', 'test@example.com', 'Test User', '$2b$10$hashedpassword', 'USER', 'ACTIVE')
ON CONFLICT ("email") DO NOTHING;

-- Add a test property
INSERT INTO "Property" ("id", "title", "description", "type", "location", "address", "price", "mediaUrls", "ownerId", "status") VALUES 
('test-property-1', 'Beautiful House', 'A beautiful 3-bedroom house in the city center', 'HOUSE', 'Mumbai', '123 Main Street, Mumbai, Maharashtra', 5000000, '[]', 'test-user-1', 'FREE')
ON CONFLICT ("id") DO NOTHING;

-- Add another test property
INSERT INTO "Property" ("id", "title", "description", "type", "location", "address", "price", "mediaUrls", "ownerId", "status") VALUES 
('test-property-2', 'Luxury Apartment', 'Modern luxury apartment with all amenities', 'APARTMENT', 'Delhi', '456 Park Avenue, Delhi', 7500000, '[]', 'test-user-1', 'FREE')
ON CONFLICT ("id") DO NOTHING;

-- Verify data was added
SELECT COUNT(*) as user_count FROM "User";
SELECT COUNT(*) as property_count FROM "Property";
