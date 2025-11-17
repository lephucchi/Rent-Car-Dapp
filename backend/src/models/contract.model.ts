import { supabaseAdmin } from '../config/database';
import { Contract, CreateContractDto, ContractEvent, CreateContractEventDto } from '../types/contract.types';

export class ContractModel {
  /**
   * Create a new contract
   */
  static async create(contractData: CreateContractDto & { lessor_id: string }): Promise<Contract> {
    const { data, error } = await supabaseAdmin
      .from('contracts')
      .insert({
        car_id: contractData.car_id,
        lessor_id: contractData.lessor_id,
        rental_fee_per_day: contractData.rental_fee_per_day,
        duration_days: contractData.duration_days,
        insurance_fee: contractData.insurance_fee,
        damage_assessor_id: contractData.damage_assessor_id || null,
        notes: contractData.notes || null
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to create contract: ${error.message}`);
    return data;
  }

  /**
   * Find contract by ID
   */
  static async findById(id: string): Promise<Contract | null> {
    const { data, error } = await supabaseAdmin
      .from('contracts')
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new Error(`Failed to find contract: ${error.message}`);
    }
    return data || null;
  }

  /**
   * Update contract blockchain details
   */
  static async updateBlockchainDetails(
    id: string,
    contractAddress: string,
    transactionHash: string
  ): Promise<Contract> {
    // Check if contract address already exists in another contract
    const { data: existing } = await supabaseAdmin
      .from('contracts')
      .select('id')
      .eq('contract_address', contractAddress)
      .neq('id', id)
      .single();

    // If address exists in another contract, nullify it first (Hardhat restart scenario)
    if (existing) {
      await supabaseAdmin
        .from('contracts')
        .update({ 
          contract_address: null,
          transaction_hash: null,
          updated_at: new Date().toISOString()
        })
        .eq('contract_address', contractAddress);
    }

    const { data, error } = await supabaseAdmin
      .from('contracts')
      .update({
        contract_address: contractAddress,
        transaction_hash: transactionHash,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(`Failed to update blockchain details: ${error.message}`);
    return data;
  }

  /**
   * Update contract status
   */
  static async updateStatus(id: string, status: string): Promise<Contract> {
    const { data, error } = await supabaseAdmin
      .from('contracts')
      .update({
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(`Failed to update status: ${error.message}`);
    return data;
  }

  /**
   * Start rental (set lessee and start_time)
   */
  static async startRental(id: string, lesseeId: string): Promise<Contract> {
    const { data, error } = await supabaseAdmin
      .from('contracts')
      .update({
        lessee_id: lesseeId,
        start_time: new Date().toISOString(),
        status: 'active',
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(`Failed to start rental: ${error.message}`);
    return data;
  }

  /**
   * Request return
   */
  static async requestReturn(id: string): Promise<Contract> {
    const { data, error } = await supabaseAdmin
      .from('contracts')
      .update({
        renter_requested_return: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(`Failed to request return: ${error.message}`);
    return data;
  }

  /**
   * Confirm return
   */
  static async confirmReturn(id: string): Promise<Contract> {
    const { data, error } = await supabaseAdmin
      .from('contracts')
      .update({
        owner_confirmed_return: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(`Failed to confirm return: ${error.message}`);
    return data;
  }

  /**
   * Report damage
   */
  static async reportDamage(id: string, description?: string): Promise<Contract> {
    const updateData: any = {
      is_damaged: true,
      updated_at: new Date().toISOString()
    };

    if (description) {
      updateData.notes = description;
    }

    const { data, error } = await supabaseAdmin
      .from('contracts')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(`Failed to report damage: ${error.message}`);
    return data;
  }

  /**
   * Set actual usage
   */
  static async setActualUsage(id: string, actualDays: number): Promise<Contract> {
    const { data, error } = await supabaseAdmin
      .from('contracts')
      .update({
        actual_days: actualDays,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(`Failed to set actual usage: ${error.message}`);
    return data;
  }

  /**
   * Complete rental
   */
  static async completeRental(id: string): Promise<Contract> {
    const { data, error } = await supabaseAdmin
      .from('contracts')
      .update({
        status: 'completed',
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(`Failed to complete rental: ${error.message}`);
    return data;
  }

  /**
   * Cancel contract
   */
  static async cancel(id: string): Promise<Contract> {
    const { data, error } = await supabaseAdmin
      .from('contracts')
      .update({
        status: 'cancelled',
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(`Failed to cancel contract: ${error.message}`);
    return data;
  }

  /**
   * Get contracts by lessor
   */
  static async findByLessor(lessorId: string, limit: number = 10, offset: number = 0): Promise<Contract[]> {
    const { data, error } = await supabaseAdmin
      .from('contracts')
      .select(`
        *,
        car:cars(*),
        lessor:users!contracts_lessor_id_fkey(*),
        lessee:users!contracts_lessee_id_fkey(*)
      `)
      .eq('lessor_id', lessorId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw new Error(`Failed to find contracts by lessor: ${error.message}`);
    return data || [];
  }

  /**
   * Get contracts by lessee
   */
  static async findByLessee(lesseeId: string, limit: number = 10, offset: number = 0): Promise<Contract[]> {
    const { data, error } = await supabaseAdmin
      .from('contracts')
      .select(`
        *,
        car:cars(*),
        lessor:users!contracts_lessor_id_fkey(*),
        lessee:users!contracts_lessee_id_fkey(*)
      `)
      .eq('lessee_id', lesseeId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw new Error(`Failed to find contracts by lessee: ${error.message}`);
    return data || [];
  }

  /**
   * Find contract by blockchain address
   */
  static async findByContractAddress(contractAddress: string): Promise<Contract | null> {
    const { data, error } = await supabaseAdmin
      .from('contracts')
      .select('*')
      .eq('contract_address', contractAddress)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new Error(`Failed to find contract by address: ${error.message}`);
    }
    return data || null;
  }

  /**
   * Get all active contracts
   */
  static async findActive(): Promise<Contract[]> {
    const { data, error } = await supabaseAdmin
      .from('contracts')
      .select('*')
      .in('status', ['pending', 'active']) // Include both pending and active contracts
      .order('created_at', { ascending: false });

    if (error) throw new Error(`Failed to find active contracts: ${error.message}`);
    return data || [];
  }

  // ==================== CONTRACT EVENTS ====================

  /**
   * Create contract event
   */
  static async createEvent(eventData: CreateContractEventDto): Promise<ContractEvent> {
    const { data, error } = await supabaseAdmin
      .from('contract_events')
      .insert({
        contract_id: eventData.contract_id,
        event_type: eventData.event_type,
        event_data: eventData.event_data,
        transaction_hash: eventData.transaction_hash,
        block_number: eventData.block_number,
        gas_used: eventData.gas_used || null,
        gas_price: eventData.gas_price || null
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to create event: ${error.message}`);
    return data;
  }

  /**
   * Get events for a contract
   */
  static async getEventsByContract(contractId: string): Promise<ContractEvent[]> {
    const { data, error } = await supabaseAdmin
      .from('contract_events')
      .select('*')
      .eq('contract_id', contractId)
      .order('created_at', { ascending: false });

    if (error) throw new Error(`Failed to get contract events: ${error.message}`);
    return data || [];
  }
}
