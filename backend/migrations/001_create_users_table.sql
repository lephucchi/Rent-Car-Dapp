-- Migration: Create Users Table
-- Description: Table to store all user types (renter, lessor, insurance, admin)

-- Create user_type enum
CREATE TYPE user_type AS ENUM ('renter', 'lessor', 'insurance', 'admin');

-- Create users table
CREATE TABLE users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    full_name TEXT NOT NULL,
    phone TEXT,
    address TEXT,
    wallet_address TEXT,
    user_type user_type NOT NULL DEFAULT 'renter',
    is_verified BOOLEAN DEFAULT FALSE,
    verification_token TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_user_type ON users(user_type);
CREATE INDEX idx_users_wallet_address ON users(wallet_address);
CREATE INDEX idx_users_verification_token ON users(verification_token);

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create policies for RLS
CREATE POLICY "Users can view their own profile" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default admin user
INSERT INTO users (email, password_hash, full_name, user_type, is_verified)
VALUES (
    'admin@rentcar.com',
    '$2b$12$LQv3c1yqBw1KcIQBVhOp8eQ5qFY4JsOzQ3oBfC7FcOzQ3oBfC7FcO', -- Default: admin123
    'System Administrator',
    'admin',
    TRUE
);
