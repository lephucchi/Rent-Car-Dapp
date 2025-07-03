import { useState } from 'react';
import Button from '../components/Button';
import Input from '../components/Input';
import { web3Service } from '../lib/web3';

interface ContractFactoryProps {
  account: string | null;
}

export default function ContractFactory({ account }: ContractFactoryProps) {
  const [make, setMake] = useState<string>('');
  const [model, setModel] = useState<string>('');
  const [year, setYear] = useState<string>('2023');
  const [pricePerDay, setPricePerDay] = useState<string>('0.01');
  const [rentalDuration, setRentalDuration] = useState<string>('7');
  const [depositAmount, setDepositAmount] = useState<string>('0.1');
  const [latePenaltyRate, setLatePenaltyRate] = useState<string>('0.005');
  const [earlyDepreciationRate, setEarlyDepreciationRate] = useState<string>('0.002');
  const [isDeploying, setIsDeploying] = useState<boolean>(false);
  const [contractAddress, setContractAddress] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleCreateContract() {
    if (!account) {
      setError("Vui lòng kết nối ví MetaMask");
      return;
    }

    try {
      setIsDeploying(true);
      setError(null);
      
      // Deploy contract using web3Service
      // In a real app, we would use a backend API to deploy the contract
      // For now, we'll simulate a successful deployment with a random address
      
      // Simulated contract deployment
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Generate a random contract address for demo purposes
      const randomAddress = "0x" + Array.from({length: 40}, () => 
        "0123456789abcdef"[Math.floor(Math.random() * 16)]).join("");
      
      setContractAddress(randomAddress);
      
      // In a real implementation, we would deploy the contract like this:
      /*
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const factory = new ethers.ContractFactory(CONTRACT_ABI, CONTRACT_BYTECODE, signer);
      const contract = await factory.deploy(
        inspector,
        make,
        model,
        year,
        ethers.utils.parseEther(pricePerDay),
        rentalDuration,
        ethers.utils.parseEther(depositAmount),
        ethers.utils.parseEther(latePenaltyRate),
        ethers.utils.parseEther(earlyDepreciationRate)
      );
      await contract.deployed();
      setContractAddress(contract.address);
      */
    } catch (err) {
      console.error('Error creating contract:', err);
      setError(err instanceof Error ? err.message : 'Lỗi không xác định');
    } finally {
      setIsDeploying(false);
    }
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Tạo Hợp Đồng Thuê Xe Mới</h2>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {contractAddress && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          <p>Hợp đồng đã được tạo thành công!</p>
          <p>Địa chỉ: <span className="font-mono">{contractAddress}</span></p>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Inspector (Cố định)</label>
          <Input 
            type="text"
            value="0x70997970C51812dc3A010C7d01b50e0d17dc79C8"
            disabled={true}
            placeholder="Inspector address"
            className="mt-1 bg-gray-100"
          />
          <p className="text-xs text-gray-500 mt-1">Địa chỉ inspector đã được cố định trong hệ thống</p>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">Hãng xe</label>
          <Input 
            type="text"
            value={make}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMake(e.target.value)}
            placeholder="Toyota"
            className="mt-1"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Model xe</label>
          <Input 
            type="text"
            value={model}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setModel(e.target.value)}
            placeholder="Camry"
            className="mt-1"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Năm sản xuất</label>
          <Input 
            type="number"
            value={year}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setYear(e.target.value)}
            min="1900"
            max="2030"
            className="mt-1"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Giá thuê mỗi ngày (ETH)</label>
          <Input 
            type="number"
            value={pricePerDay}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPricePerDay(e.target.value)}
            step="0.001"
            min="0.001"
            className="mt-1"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Thời gian thuê (ngày)</label>
          <Input 
            type="number"
            value={rentalDuration}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRentalDuration(e.target.value)}
            min="1"
            className="mt-1"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Tiền đặt cọc (ETH)</label>
          <Input 
            type="number"
            value={depositAmount}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDepositAmount(e.target.value)}
            step="0.01"
            min="0.01"
            className="mt-1"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Phí phạt trễ/ngày (ETH)</label>
          <Input 
            type="number"
            value={latePenaltyRate}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLatePenaltyRate(e.target.value)}
            step="0.001"
            min="0"
            className="mt-1"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Phí khấu hao trả sớm/ngày (ETH)</label>
          <Input 
            type="number"
            value={earlyDepreciationRate}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEarlyDepreciationRate(e.target.value)}
            step="0.001"
            min="0"
            className="mt-1"
          />
        </div>
      </div>
      
      <Button 
        onClick={handleCreateContract}
        disabled={isDeploying || !make || !model}
        className="w-full"
      >
        {isDeploying ? 'Đang tạo hợp đồng...' : 'Tạo Hợp Đồng'}
      </Button>
    </div>
  );
}
