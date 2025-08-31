-- Migration: Create Contracts Table
-- Description: Table to store rental contract information

-- Create contract_status enum
CREATE TYPE contract_status AS ENUM ('pending', 'active', 'completed', 'cancelled');

-- Create contracts table
CREATE TABLE contracts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    car_id UUID NOT NULL REFERENCES cars(id) ON DELETE CASCADE,
    lessor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    lessee_id UUID REFERENCES users(id) ON DELETE SET NULL,
    damage_assessor_id UUID REFERENCES users(id) ON DELETE SET NULL,
    
    -- Smart contract details
    contract_address TEXT UNIQUE, -- Blockchain contract address
    transaction_hash TEXT, -- Deploy transaction hash
    
    -- Rental terms
    rental_fee_per_day NUMERIC(10,2) NOT NULL CHECK (rental_fee_per_day > 0),
    duration_days INTEGER NOT NULL CHECK (duration_days > 0),
    insurance_fee NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (insurance_fee >= 0),
    
    -- Rental execution details
    start_time TIMESTAMP WITH TIME ZONE,
    actual_days INTEGER DEFAULT 0 CHECK (actual_days >= 0),
    assessed_damage_amount NUMERIC(10,2) DEFAULT 0 CHECK (assessed_damage_amount >= 0),
    
    -- Status tracking
    status contract_status NOT NULL DEFAULT 'pending',
    is_damaged BOOLEAN DEFAULT FALSE,
    renter_requested_return BOOLEAN DEFAULT FALSE,
    owner_confirmed_return BOOLEAN DEFAULT FALSE,
    
    -- Metadata
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT chk_lessor_not_lessee CHECK (lessor_id != lessee_id)
);

-- Create indexes for performance
CREATE INDEX idx_contracts_car_id ON contracts(car_id);
CREATE INDEX idx_contracts_lessor_id ON contracts(lessor_id);
CREATE INDEX idx_contracts_lessee_id ON contracts(lessee_id);
CREATE INDEX idx_contracts_status ON contracts(status);
CREATE INDEX idx_contracts_contract_address ON contracts(contract_address);
CREATE INDEX idx_contracts_created_at ON contracts(created_at);

-- Enable Row Level Security (RLS)
ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;

-- Create policies for RLS
CREATE POLICY "Users can view their own contracts" ON contracts
    FOR SELECT USING (
        auth.uid() = lessor_id OR 
        auth.uid() = lessee_id OR 
        auth.uid() = damage_assessor_id OR
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() 
            AND user_type = 'admin'
        )
    );

CREATE POLICY "Lessors can create contracts" ON contracts
    FOR INSERT WITH CHECK (
        auth.uid() = lessor_id AND
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() 
            AND user_type = 'lessor'
        )
    );

CREATE POLICY "Contract parties can update" ON contracts
    FOR UPDATE USING (
        auth.uid() = lessor_id OR 
        auth.uid() = lessee_id OR 
        auth.uid() = damage_assessor_id OR
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() 
            AND user_type = 'admin'
        )
    );

-- Create trigger for updated_at
CREATE TRIGGER update_contracts_updated_at 
    BEFORE UPDATE ON contracts 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to validate damage assessor type
CREATE OR REPLACE FUNCTION validate_damage_assessor()
RETURNS TRIGGER AS $$
BEGIN
    -- Check if damage_assessor_id is set and if user is of type 'insurance'
    IF NEW.damage_assessor_id IS NOT NULL THEN
        IF NOT EXISTS (
            SELECT 1 FROM users 
            WHERE id = NEW.damage_assessor_id 
            AND user_type = 'insurance'
        ) THEN
            RAISE EXCEPTION 'Damage assessor must be a user with type insurance';
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to validate damage assessor
CREATE TRIGGER validate_damage_assessor_trigger
    BEFORE INSERT OR UPDATE ON contracts
    FOR EACH ROW EXECUTE FUNCTION validate_damage_assessor();
