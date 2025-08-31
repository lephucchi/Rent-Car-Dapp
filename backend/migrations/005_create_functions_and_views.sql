-- Migration: Setup Functions and Initial Data
-- Description: Create additional functions and seed data

-- Function to get available damage assessors
CREATE OR REPLACE FUNCTION get_available_damage_assessors()
RETURNS TABLE (
    id UUID,
    full_name TEXT,
    email TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT u.id, u.full_name, u.email
    FROM users u
    WHERE u.user_type = 'insurance'
    AND u.is_verified = TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to calculate contract total cost
CREATE OR REPLACE FUNCTION calculate_contract_total_cost(
    p_rental_fee_per_day NUMERIC,
    p_duration_days INTEGER,
    p_insurance_fee NUMERIC
)
RETURNS NUMERIC AS $$
BEGIN
    RETURN (p_rental_fee_per_day * p_duration_days) + p_insurance_fee;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to calculate deposit (30% of total cost)
CREATE OR REPLACE FUNCTION calculate_deposit(
    p_rental_fee_per_day NUMERIC,
    p_duration_days INTEGER,
    p_insurance_fee NUMERIC
)
RETURNS NUMERIC AS $$
BEGIN
    RETURN (calculate_contract_total_cost(p_rental_fee_per_day, p_duration_days, p_insurance_fee) * 0.30);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to update car status when contract changes
CREATE OR REPLACE FUNCTION update_car_status_on_contract_change()
RETURNS TRIGGER AS $$
BEGIN
    -- When a contract becomes active, mark car as rented
    IF NEW.status = 'active' AND (OLD.status IS NULL OR OLD.status != 'active') THEN
        UPDATE cars SET status = 'rented' WHERE id = NEW.car_id;
    -- When a contract is completed or cancelled, mark car as available
    ELSIF NEW.status IN ('completed', 'cancelled') AND OLD.status != NEW.status THEN
        UPDATE cars SET status = 'available' WHERE id = NEW.car_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for car status updates
CREATE TRIGGER trigger_update_car_status_on_contract_change
    AFTER UPDATE ON contracts
    FOR EACH ROW
    EXECUTE FUNCTION update_car_status_on_contract_change();

-- Insert sample damage assessors (insurance companies)
INSERT INTO users (email, password_hash, full_name, user_type, is_verified) VALUES
('assessor1@insurance.com', '$2b$12$LQv3c1yqBw1KcIQBVhOp8eQ5qFY4JsOzQ3oBfC7FcOzQ3oBfC7FcO', 'VietNam Insurance Assessor', 'insurance', TRUE),
('assessor2@insurance.com', '$2b$12$LQv3c1yqBw1KcIQBVhOp8eQ5qFY4JsOzQ3oBfC7FcOzQ3oBfC7FcO', 'Bao Viet Damage Assessor', 'insurance', TRUE),
('assessor3@insurance.com', '$2b$12$LQv3c1yqBw1KcIQBVhOp8eQ5qFY4JsOzQ3oBfC7FcOzQ3oBfC7FcO', 'PVI Insurance Assessor', 'insurance', TRUE);

-- Create view for contract summary
CREATE VIEW contract_summary AS
SELECT 
    c.id,
    c.status,
    c.rental_fee_per_day,
    c.duration_days,
    c.insurance_fee,
    c.contract_address,
    car.name as car_name,
    car.model as car_model,
    car.license_plate,
    lessor.full_name as lessor_name,
    lessee.full_name as lessee_name,
    assessor.full_name as assessor_name,
    calculate_contract_total_cost(c.rental_fee_per_day, c.duration_days, c.insurance_fee) as total_cost,
    calculate_deposit(c.rental_fee_per_day, c.duration_days, c.insurance_fee) as deposit_amount,
    c.created_at,
    c.updated_at
FROM contracts c
JOIN cars car ON c.car_id = car.id
JOIN users lessor ON c.lessor_id = lessor.id
LEFT JOIN users lessee ON c.lessee_id = lessee.id
LEFT JOIN users assessor ON c.damage_assessor_id = assessor.id;
