-- Migration: Create Contract Events Table
-- Description: Table to store blockchain events related to contracts

-- Create contract_events table
CREATE TABLE contract_events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    contract_id UUID NOT NULL REFERENCES contracts(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL, -- 'RentalStarted', 'RentalCancelled', 'DamageReported', etc.
    event_data JSONB NOT NULL DEFAULT '{}'::jsonb,
    transaction_hash TEXT NOT NULL,
    block_number BIGINT NOT NULL,
    gas_used BIGINT,
    gas_price BIGINT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_contract_events_contract_id ON contract_events(contract_id);
CREATE INDEX idx_contract_events_event_type ON contract_events(event_type);
CREATE INDEX idx_contract_events_transaction_hash ON contract_events(transaction_hash);
CREATE INDEX idx_contract_events_block_number ON contract_events(block_number);
CREATE INDEX idx_contract_events_created_at ON contract_events(created_at);

-- Enable Row Level Security (RLS)
ALTER TABLE contract_events ENABLE ROW LEVEL SECURITY;

-- Create policies for RLS
CREATE POLICY "Users can view events for their contracts" ON contract_events
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM contracts 
            WHERE contracts.id = contract_events.contract_id 
            AND (
                contracts.lessor_id = auth.uid() OR 
                contracts.lessee_id = auth.uid() OR 
                contracts.damage_assessor_id = auth.uid() OR
                EXISTS (
                    SELECT 1 FROM users 
                    WHERE users.id = auth.uid() 
                    AND users.user_type = 'admin'
                )
            )
        )
    );
