import { 
  JsonRpcProvider, 
  parseEther, 
  formatEther, 
  Contract, 
  ContractFactory, 
  Wallet,
  TransactionReceipt
} from 'ethers';

// Simplified ABI for the rental contract
const contractABI = [
  "constructor(string memory _assetName, uint _rentalFeePerDay, uint _durationDays, uint _insuranceFee, address _damageAssessor)",
  "function rent() external payable",
  "function cancelRental() external",
  "function requestReturn() external",
  "function confirmReturn() external",
  "function completeRental() external payable",
  "function reportDamage() external",
  "function assessDamage(uint amountInEther) external",
  "function setActualUsage(uint _actualDays) external",
  "function getTotalRentalFee() public view returns (uint)",
  "function getDeposit() public view returns (uint)",
  "function getRemainingPayment() public view returns (uint)",
  "function getFinalPaymentAmount() external view returns (uint)",
  "function lessor() public view returns (address)",
  "function lessee() public view returns (address)",
  "function assetName() public view returns (string)",
  "function rentalFeePerDay() public view returns (uint)",
  "function durationDays() public view returns (uint)",
  "function insuranceFee() public view returns (uint)",
  "function isRented() public view returns (bool)",
  "function isDamaged() public view returns (bool)",
  "function actualDays() public view returns (uint)",
  "function assessedDamageAmount() public view returns (uint)",
  "event RentalStarted(address lessee, uint deposit)",
  "event RentalCancelled(address lessee)",
  "event DamageReported(address lessor)",
  "event RenterRequestedReturn(address lessee)",
  "event OwnerConfirmedReturn(address lessor)",
  "event ActualUsageSet(uint daysUsed)",
  "event DamageAssessed(address assessor, uint amount)",
  "event FundsTransferred(address to, uint amount)"
];

// Contract bytecode placeholder - should be loaded from compiled artifacts
const contractBytecode = "0x608060405234801561001057600080fd5b50600436106100415760003560e01c8063445df0ac146100465780638da5cb5b14610064578063fdacd57614610082575b600080fd5b61004e610084565b60405161005b9190610123565b60405180910390f35b61006c61008a565b604051610079919061010e565b60405180910390f35b005b60005481565b60015481565b600080fd5b6000819050919050565b6100a781610094565b81146100b257600080fd5b50565b6000813590506100c48161009e565b92915050565b6000602082840312156100e0576100df61008f565b5b60006100ee848285016100b5565b91505092915050565b610100816100ca565b82525050565b600060208201905061011b60008301846100f7565b92915050565b600060208201905061013660008301846100f7565b9291505056fea264697066735822122068656c6c6f20776f726c64000000000000000000000000000000000000000000600052602260045260246000fd";

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

    // Initialize signer if private key is provided
    if (process.env.PRIVATE_KEY) {
      this.signer = new Wallet(process.env.PRIVATE_KEY, this.provider);
    }
  }

  /**
   * Deploy a new rental contract
   */
  async deployRentalContract(
    assetName: string,
    rentalFeePerDay: number,
    durationDays: number,
    insuranceFee: number,
    damageAssessor: string
  ): Promise<DeploymentResult> {
    if (!this.signer) {
      throw new Error('Signer not initialized. Please check PRIVATE_KEY environment variable.');
    }

    try {
      // Convert fees to Wei
      const rentalFeeWei = parseEther(rentalFeePerDay.toString());
      const insuranceFeeWei = parseEther(insuranceFee.toString());

      // Create contract factory
      const contractFactory = new ContractFactory(contractABI, contractBytecode, this.signer);

      // Deploy contract
      const contract = await contractFactory.deploy(
        assetName,
        rentalFeeWei,
        durationDays,
        insuranceFeeWei,
        damageAssessor
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
      
      const [totalRentalFee, deposit, remainingPayment, finalPayment] = await Promise.all([
        contract.getTotalRentalFee(),
        contract.getDeposit(),
        contract.getRemainingPayment(),
        contract.getFinalPaymentAmount()
      ]);

      return {
        totalRentalFee: formatEther(totalRentalFee),
        deposit: formatEther(deposit),
        remainingPayment: formatEther(remainingPayment),
        finalPayment: formatEther(finalPayment)
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
    insuranceFee: number,
    damageAssessor: string
  ): Promise<string> {
    if (!this.signer) {
      throw new Error('Signer not initialized');
    }

    try {
      const contractFactory = new ContractFactory(contractABI, contractBytecode, this.signer);
      
      const deployTransaction = await contractFactory.getDeployTransaction(
        assetName,
        parseEther(rentalFeePerDay.toString()),
        durationDays,
        parseEther(insuranceFee.toString()),
        damageAssessor
      );

      const gasEstimate = await this.provider.estimateGas(deployTransaction);
      return gasEstimate.toString();
    } catch (error: any) {
      throw new Error(`Gas estimation failed: ${error.message}`);
    }
  }
}

export default BlockchainService;
