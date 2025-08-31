export type ContractStatus = 'pending' | 'active' | 'completed' | 'cancelled';

export interface Contract {
  id: string;
  car_id: string;
  lessor_id: string;
  lessee_id?: string;
  damage_assessor_id?: string;
  contract_address?: string;
  transaction_hash?: string;
  rental_fee_per_day: number;
  duration_days: number;
  insurance_fee: number;
  start_time?: string;
  actual_days: number;
  assessed_damage_amount: number;
  status: ContractStatus;
  is_damaged: boolean;
  renter_requested_return: boolean;
  owner_confirmed_return: boolean;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateContractDto {
  car_id: string;
  damage_assessor_id?: string;
  rental_fee_per_day: number;
  duration_days: number;
  insurance_fee: number;
  notes?: string;
}

export interface UpdateContractDto {
  lessee_id?: string;
  contract_address?: string;
  transaction_hash?: string;
  start_time?: string;
  actual_days?: number;
  assessed_damage_amount?: number;
  status?: ContractStatus;
  is_damaged?: boolean;
  renter_requested_return?: boolean;
  owner_confirmed_return?: boolean;
  notes?: string;
}

export interface ContractEvent {
  id: string;
  contract_id: string;
  event_type: string;
  event_data: Record<string, any>;
  transaction_hash: string;
  block_number: number;
  gas_used?: number;
  gas_price?: number;
  created_at: string;
}
