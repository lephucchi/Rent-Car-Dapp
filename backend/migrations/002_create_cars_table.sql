-- Migration: Create Cars Table
-- Description: Table to store car information for rental

-- Create car_status enum
CREATE TYPE car_status AS ENUM ('available', 'rented', 'maintenance');

-- Create cars table
CREATE TABLE cars (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    lessor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    model TEXT NOT NULL,
    year INTEGER NOT NULL CHECK (year >= 1900 AND year <= EXTRACT(year FROM NOW()) + 2),
    license_plate TEXT NOT NULL UNIQUE,
    rental_fee_per_day NUMERIC(10,2) NOT NULL CHECK (rental_fee_per_day > 0),
    insurance_fee NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (insurance_fee >= 0),
    description TEXT,
    images JSONB DEFAULT '[]'::jsonb,
    status car_status NOT NULL DEFAULT 'available',
    location TEXT,
    features JSONB DEFAULT '{}'::jsonb, -- Additional car features (AC, GPS, etc.)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_cars_lessor_id ON cars(lessor_id);
CREATE INDEX idx_cars_status ON cars(status);
CREATE INDEX idx_cars_license_plate ON cars(license_plate);
CREATE INDEX idx_cars_location ON cars(location);
CREATE INDEX idx_cars_rental_fee ON cars(rental_fee_per_day);

-- Enable Row Level Security (RLS)
ALTER TABLE cars ENABLE ROW LEVEL SECURITY;

-- Create policies for RLS
CREATE POLICY "Anyone can view available cars" ON cars
    FOR SELECT USING (status = 'available');

CREATE POLICY "Lessors can view their own cars" ON cars
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = cars.lessor_id 
            AND users.id = auth.uid()
        )
    );

CREATE POLICY "Lessors can insert their own cars" ON cars
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = cars.lessor_id 
            AND users.id = auth.uid()
            AND users.user_type = 'lessor'
        )
    );

CREATE POLICY "Lessors can update their own cars" ON cars
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = cars.lessor_id 
            AND users.id = auth.uid()
        )
    );

-- Create trigger for updated_at
CREATE TRIGGER update_cars_updated_at 
    BEFORE UPDATE ON cars 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
