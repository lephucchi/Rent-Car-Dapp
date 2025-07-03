import { useState, useEffect } from 'react';
import Navigation from "../components/Navigation";
import Button from "../components/Button";
import ContractFactory from "../components/ContractFactory";
import ContractDetails from "../components/ContractDetails";
import { web3Service } from "../lib/web3";

export default function RentContract() {
  const [account, setAccount] = useState<string | null>(null);
  const [balance, setBalance] = useState<string | null>(null);
  const [network, setNetwork] = useState<string | null>(null);
  const [contractAddress, setContractAddress] = useState<string | null>(null);
  const [connecting, setConnecting] = useState<boolean>(false);

  useEffect(() => {
    // Check if wallet was previously connected
    const savedAccount = localStorage.getItem('connectedAccount');
    const savedContract = localStorage.getItem('selectedContract');
    
    if (savedAccount) {
      connectWallet();
    }
    
    if (savedContract) {
      setContractAddress(savedContract);
    }
  }, []);

  async function connectWallet() {
    try {
      setConnecting(true);
      const { address, balance, network } = await web3Service.connectWallet();
      setAccount(address);
      setBalance(balance);
      setNetwork(network);
      
      // Save connected account
      localStorage.setItem('connectedAccount', address);
    } catch (error) {
      console.error('Error connecting wallet:', error);
      alert('Không thể kết nối ví. Vui lòng đảm bảo bạn đã cài đặt MetaMask và đã cấp quyền cho trang web.');
    } finally {
      setConnecting(false);
    }
  }

  function handleContractChange(e: React.ChangeEvent<HTMLInputElement>) {
    const address = e.target.value;
    setContractAddress(address);
    
    if (address) {
      localStorage.setItem('selectedContract', address);
    } else {
      localStorage.removeItem('selectedContract');
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navigation />
      <div className="container mx-auto p-4 pt-20">
        <h1 className="text-3xl font-bold mb-6">Quản lý Hợp đồng Thuê Xe</h1>
        
        <div className="mb-8">
          {!account ? (
            <Button 
              onClick={connectWallet}
              disabled={connecting}
            >
              {connecting ? 'Đang kết nối...' : 'Kết nối ví MetaMask'}
            </Button>
          ) : (
            <div className="p-4 bg-blue-50 rounded-lg mb-6">
              <h2 className="text-xl font-semibold mb-2">Thông tin ví</h2>
              <p><span className="font-medium">Địa chỉ:</span> <span className="font-mono">{account}</span></p>
              <p><span className="font-medium">Số dư:</span> {balance} ETH</p>
              <p><span className="font-medium">Mạng:</span> {network}</p>
            </div>
          )}
        </div>
        
        {account && (
          <>
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-4">Tìm kiếm hợp đồng</h2>
              <div className="flex gap-4">
                <input 
                  type="text"
                  value={contractAddress || ''}
                  onChange={handleContractChange}
                  placeholder="Nhập địa chỉ hợp đồng..."
                  className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
                <Button 
                  onClick={() => setContractAddress('')}
                  variant="outline"
                >
                  Xóa
                </Button>
              </div>
            </div>
            
            {contractAddress ? (
              <ContractDetails
                contractAddress={contractAddress}
                account={account}
              />
            ) : (
              <ContractFactory account={account} />
            )}
          </>
        )}
      </div>
    </div>
  );
}
