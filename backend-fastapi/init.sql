-- Initialize database for car rental DApp
-- This script will be run when PostgreSQL container starts

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    wallet_address VARCHAR(42) UNIQUE,
    role VARCHAR(20) DEFAULT 'user',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_wallet_address ON users(wallet_address);
CREATE INDEX IF NOT EXISTS idx_users_active ON users(is_active);

-- Insert default admin user (password: "admin123")
-- Password hash for "admin123" using bcrypt
INSERT INTO users (username, email, hashed_password, role) 
VALUES ('admin', 'admin@carrental.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/BKEP4w.6u', 'admin')
ON CONFLICT (username) DO NOTHING;

-- Insert test user (password: "user123")
INSERT INTO users (username, email, hashed_password, role)
VALUES ('testuser', 'user@carrental.com', '$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', 'user')
ON CONFLICT (username) DO NOTHING;

COMMIT;
