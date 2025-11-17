import { 
  JsonRpcProvider, 
  parseEther, 
  formatEther, 
  Contract, 
  ContractFactory, 
  Wallet,
  TransactionReceipt
} from 'ethers';
import path from 'path';
import fs from 'fs';

// Load contract ABI from compiled artifacts
const artifactPath = path.join(__dirname, '../../../smartcontract/artifacts/contracts/FixedRentalContract.sol/FixedRentalContract.json');
const contractArtifact = JSON.parse(fs.readFileSync(artifactPath, 'utf8'));
const contractABI = contractArtifact.abi;

interface DeploymentResult {
  contractAddress: string;
  transactionHash: string;
  deploymentCost: string;
  contractDetails?: {
    assetName: string;
    rentalFeePerDay: string;
    durationDays: number;
    insuranceFee: string;
    totalRentalFee: string;
    requiredDeposit: string;
    lessor: string;
  };
}

interface ContractInteractionResult {
  success: boolean;
  transactionHash?: string;
  data?: any;
  error?: string;
}

interface EventListener {
  eventName: string;
  eventHandler: (event: any) => void;
}

export class BlockchainService {
  private provider: JsonRpcProvider;
  private signer: Wallet | null = null;

  constructor() {
    // Initialize provider
    this.provider = new JsonRpcProvider(
      process.env.BLOCKCHAIN_RPC_URL || 'http://127.0.0.1:8545'
    );

    // Initialize signer if private key is provided and valid
    if (process.env.PRIVATE_KEY && 
        process.env.PRIVATE_KEY !== '0xyour_private_key_here' &&
        process.env.PRIVATE_KEY.length > 10) {
      this.signer = new Wallet(process.env.PRIVATE_KEY, this.provider);
    } else {
      console.warn('⚠️  PRIVATE_KEY not configured - blockchain deployment disabled');
    }
  }

  /**
   * Deploy a new rental contract
   */
  async deployRentalContract(
    assetName: string,
    rentalFeePerDay: number,
    durationDays: number,
    insuranceFee: number
  ): Promise<DeploymentResult> {
    if (!this.signer) {
      throw new Error('Signer not initialized. Please check PRIVATE_KEY environment variable.');
    }

    try {
      // Convert days to minutes for contract (1 day = 1440 minutes)
      const durationMinutes = durationDays * 1440;
      // Convert daily fee to per-minute fee
      const rentalFeePerMinute = rentalFeePerDay / 1440;
      
      // Convert fees to Wei
      const rentalFeeWei = parseEther(rentalFeePerMinute.toFixed(18));
      const insuranceFeeWei = parseEther(insuranceFee.toString());
      // Insurance compensation = 2x insurance fee (can be adjusted)
      const insuranceCompensationWei = parseEther((insuranceFee * 2).toString());

      // Load compiled contract ABI and bytecode
      const artifactPath = path.join(__dirname, '../../../smartcontract/artifacts/contracts/FixedRentalContract.sol/FixedRentalContract.json');
      const contractArtifact = JSON.parse(fs.readFileSync(artifactPath, 'utf8'));
      
      // Create contract factory
      const contractFactory = new ContractFactory(
        contractArtifact.abi, 
        contractArtifact.bytecode, 
        this.signer
      );

      // Deploy contract
      const contract = await contractFactory.deploy(
        assetName,
        rentalFeeWei,
        durationMinutes,
        insuranceFeeWei,
        insuranceCompensationWei
      );

      // Wait for deployment
      const deploymentReceipt = await contract.deploymentTransaction()?.wait();
      if (!deploymentReceipt) {
        throw new Error('Deployment transaction failed');
      }

      console.log('✅ Contract deployed successfully:', await contract.getAddress());

      return {
        contractAddress: await contract.getAddress(),
        transactionHash: deploymentReceipt.hash,
        deploymentCost: formatEther(deploymentReceipt.gasUsed * deploymentReceipt.gasPrice)
      };

    } catch (error: any) {
      console.error('❌ Contract deployment failed:', error);
      throw new Error(`Contract deployment failed: ${error.message || 'Unknown error'}`);
    }
  }

  /**
   * Get contract instance
   */
  getContract(contractAddress: string): Contract {
    if (!this.signer) {
      throw new Error('Signer not initialized');
    }
    return new Contract(contractAddress, contractABI, this.signer);
  }

  /**
   * Setup event listeners for a contract
   */
  setupEventListeners(
    contractAddress: string,
    listeners: EventListener[]
  ): Contract {
    const contract = this.getContract(contractAddress);

    listeners.forEach(({ eventName, eventHandler }) => {
      contract.on(eventName, eventHandler);
    });

    return contract;
  }

  /**
   * Start rental process
   */
  async startRental(
    contractAddress: string,
    depositAmount: string
  ): Promise<ContractInteractionResult> {
    try {
      const contract = this.getContract(contractAddress);
      const tx = await contract.rent({ 
        value: parseEther(depositAmount) 
      });
      
      const receipt = await tx.wait();
      
      return {
        success: true,
        transactionHash: receipt.hash,
        data: {
          blockNumber: receipt.blockNumber,
          gasUsed: receipt.gasUsed.toString()
        }
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Transaction failed'
      };
    }
  }

  /**
   * Cancel rental
   */
  async cancelRental(contractAddress: string): Promise<ContractInteractionResult> {
    try {
      const contract = this.getContract(contractAddress);
      const tx = await contract.cancelRental();
      const receipt = await tx.wait();
      
      return {
        success: true,
        transactionHash: receipt.hash
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Transaction failed'
      };
    }
  }

  /**
   * Get contract status and details
   */
  async getContractStatus(contractAddress: string) {
    try {
      const contract = this.getContract(contractAddress);
      
      const [
        assetName,
        lessor,
        lessee,
        rentalFeePerDay,
        durationDays,
        insuranceFee,
        isRented,
        isDamaged,
        actualDays,
        assessedDamageAmount
      ] = await Promise.all([
        contract.assetName(),
        contract.lessor(),
        contract.lessee(),
        contract.rentalFeePerDay(),
        contract.durationDays(),
        contract.insuranceFee(),
        contract.isRented(),
        contract.isDamaged(),
        contract.actualDays(),
        contract.assessedDamageAmount()
      ]);

      return {
        assetName,
        lessor,
        lessee,
        rentalFeePerDay: formatEther(rentalFeePerDay),
        durationDays: Number(durationDays),
        insuranceFee: formatEther(insuranceFee),
        isRented,
        isDamaged,
        actualDays: Number(actualDays),
        assessedDamageAmount: formatEther(assessedDamageAmount)
      };
    } catch (error: any) {
      throw new Error(`Failed to get contract status: ${error.message}`);
    }
  }

  /**
   * Get rental costs
   */
  async getRentalCosts(contractAddress: string) {
    try {
      const contract = this.getContract(contractAddress);
      
      // Only get basic costs - don't call methods that require isRented=true
      const [totalRentalFee, deposit] = await Promise.all([
        contract.getTotalRentalFee(),
        contract.getDeposit()
      ]);

      return {
        totalRentalFee: formatEther(totalRentalFee),
        deposit: formatEther(deposit),
        remainingPayment: "0", // Will be calculated after rental starts
        finalPayment: "0" // Will be calculated after rental starts
      };
    } catch (error: any) {
      throw new Error(`Failed to get rental costs: ${error.message}`);
    }
  }

  /**
   * Execute contract function with optional value
   */
  async executeContractFunction(
    contractAddress: string,
    functionName: string,
    args: any[] = [],
    value?: string
  ): Promise<{ success: boolean; transactionHash?: string; receipt?: TransactionReceipt; error?: string }> {
    try {
      const contract = this.getContract(contractAddress);
      
      const options: any = {};
      if (value) {
        options.value = parseEther(value);
      }

      const tx = await contract[functionName](...args, options);
      const receipt = await tx.wait();
      
      return {
        success: true,
        transactionHash: receipt.hash,
        receipt
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Transaction failed'
      };
    }
  }

  /**
   * Get account balance
   */
  async getBalance(address: string): Promise<string> {
    const balance = await this.provider.getBalance(address);
    return formatEther(balance);
  }

  /**
   * Get current gas price
   */
  async getGasPrice(): Promise<string> {
    const gasPrice = await this.provider.getFeeData();
    return formatEther(gasPrice.gasPrice || 0);
  }

  /**
   * Estimate gas for contract deployment
   */
  async estimateDeploymentGas(
    assetName: string,
    rentalFeePerDay: number,
    durationDays: number,
    insuranceFee: number
  ): Promise<string> {
    if (!this.signer) {
      throw new Error('Signer not initialized');
    }

    try {
      // Convert days to minutes
      const durationMinutes = durationDays * 1440;
      const rentalFeePerMinute = rentalFeePerDay / 1440;
      
      const rentalFeeWei = parseEther(rentalFeePerMinute.toFixed(18));
      const insuranceFeeWei = parseEther(insuranceFee.toString());
      const insuranceCompensationWei = parseEther((insuranceFee * 2).toString());

      // Load artifact
      const artifactPath = path.join(__dirname, '../../../smartcontract/artifacts/contracts/FixedRentalContract.sol/FixedRentalContract.json');
      const contractArtifact = JSON.parse(fs.readFileSync(artifactPath, 'utf8'));
      
      const contractFactory = new ContractFactory(contractArtifact.abi, contractArtifact.bytecode, this.signer);
      
      const deployTransaction = await contractFactory.getDeployTransaction(
        assetName,
        rentalFeeWei,
        durationMinutes,
        insuranceFeeWei,
        insuranceCompensationWei
      );

      const gasEstimate = await this.provider.estimateGas(deployTransaction);
      return gasEstimate.toString();
    } catch (error: any) {
      throw new Error(`Gas estimation failed: ${error.message}`);
    }
  }
}

export default BlockchainService;
