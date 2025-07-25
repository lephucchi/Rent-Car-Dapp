import { useState, useEffect } from 'react';
import Navigation from "../components/Navigation";
import Button from "../components/Button";
import { MetaMaskConnect } from "../components/MetaMaskConnect";
import { web3Service, ContractStatus } from "../lib/web3";
import type { ContractInfo } from '../lib/web3';

// Địa chỉ ví cố định cho bên kiểm định
const INSPECTOR_ADDRESS = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8";

interface PendingInspection {
  contractAddress: string;
  contractInfo: ContractInfo;
}

export default function Inspector() {
  const [account, setAccount] = useState<string | null>(null);
  const [balance, setBalance] = useState<string | null>(null);
  const [network, setNetwork] = useState<string | null>(null);
  const [connecting, setConnecting] = useState<boolean>(false);
  const [pendingInspections, setPendingInspections] = useState<PendingInspection[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [inspectionData, setInspectionData] = useState<{[key: string]: {isDamaged: boolean, compensation: string}}>({});

  useEffect(() => {
    // Check if wallet was previously connected
    const savedAccount = localStorage.getItem('connectedAccount');
    if (savedAccount && savedAccount.toLowerCase() === INSPECTOR_ADDRESS.toLowerCase()) {
      connectWallet();
    }
  }, []);

  useEffect(() => {
    if (account && account.toLowerCase() === INSPECTOR_ADDRESS.toLowerCase()) {
      loadPendingInspections();
    }
  }, [account]);

  async function connectWallet() {
    try {
      setConnecting(true);
      setError(null);

      const { address, balance, network } = await web3Service.connectWallet();

      // Kiểm tra xem địa chỉ có phải là inspector không
      if (address.toLowerCase() !== INSPECTOR_ADDRESS.toLowerCase()) {
        throw new Error(`Only the inspector account (${INSPECTOR_ADDRESS}) can access this page`);
      }

      setAccount(address);
      setBalance(balance);
      setNetwork(network);

      // Save connected account
      localStorage.setItem('connectedAccount', address);
    } catch (error) {
      console.error('Error connecting wallet:', error);
      setError(error instanceof Error ? error.message : 'Wallet connection error');
    } finally {
      setConnecting(false);
    }
  }

  async function loadPendingInspections() {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch pending inspections list from backend API
      const backendUrl = import.meta.env.VITE_BACKEND_URL;
      const res = await fetch(`${backendUrl}/api/inspections/pending`);
      const data = await res.json();
      const sampleContracts: string[] = data.contracts || [];
      
      const inspections: PendingInspection[] = [];
      
      for (const contractAddress of sampleContracts) {
        try {
          const contractInfo = await web3Service.getContractInfo(contractAddress);
          // Only show contracts in Returned status for this inspector
          if (contractInfo.status === ContractStatus.Returned && 
              contractInfo.inspector.toLowerCase() === account?.toLowerCase()) {
            inspections.push({ contractAddress, contractInfo });
          }
        } catch (err) {
          console.warn(`Không thể tải hợp đồng ${contractAddress}:`, err);
        }
      }
      
      setPendingInspections(inspections);
    } catch (err) {
      console.error('Error loading pending inspections:', err);
      setError('Không thể tải danh sách kiểm định');
    } finally {
      setLoading(false);
    }
  }

  async function handleInspection(contractAddress: string) {
    const inspectionInfo = inspectionData[contractAddress];
    if (!inspectionInfo) return;

    try {
      setLoading(true);
      setError(null);
      
      await web3Service.inspectCar(
        contractAddress, 
        inspectionInfo.isDamaged, 
        inspectionInfo.compensation
      );
      
      // Reload pending inspections
      await loadPendingInspections();
      
      // Clear inspection data for this contract
      setInspectionData(prev => {
        const newData = { ...prev };
        delete newData[contractAddress];
        return newData;
      });
      
      alert('Kiểm định đã được hoàn thành thành công!');
    } catch (err) {
      console.error('Error completing inspection:', err);
      setError('Không thể hoàn thành kiểm định');
    } finally {
      setLoading(false);
    }
  }

  function updateInspectionData(contractAddress: string, field: 'isDamaged' | 'compensation', value: boolean | string) {
    setInspectionData(prev => ({
      ...prev,
      [contractAddress]: {
        ...prev[contractAddress],
        isDamaged: field === 'isDamaged' ? value as boolean : prev[contractAddress]?.isDamaged || false,
        compensation: field === 'compensation' ? value as string : prev[contractAddress]?.compensation || '0'
      }
    }));
  }

  function addManualContract() {
    const contractAddress = prompt('Nhập địa chỉ hợp đồng cần kiểm định:');
    if (contractAddress && contractAddress.startsWith('0x')) {
      loadContractForInspection(contractAddress);
    }
  }

  async function loadContractForInspection(contractAddress: string) {
    try {
      const contractInfo = await web3Service.getContractInfo(contractAddress);
      
      if (contractInfo.status !== ContractStatus.Returned) {
        alert('Hợp đồng này không ở trạng thái chờ kiểm định');
        return;
      }
      
      if (contractInfo.inspector.toLowerCase() !== account?.toLowerCase()) {
        alert('Bạn không phải là người kiểm định được chỉ định cho hợp đồng này');
        return;
      }
      
      // Add to pending inspections if not already there
      const exists = pendingInspections.find(p => p.contractAddress.toLowerCase() === contractAddress.toLowerCase());
      if (!exists) {
        setPendingInspections(prev => [...prev, { contractAddress, contractInfo }]);
      }
    } catch (err) {
      console.error('Error loading contract:', err);
      alert('Không thể tải thông tin hợp đồng');
    }
  }

  if (!account) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <div className="container-responsive py-8 pt-20">
          <h1 className="text-3xl font-bold gradient-text text-center mb-8">
            Car Inspector Dashboard
          </h1>

          <div className="max-w-md mx-auto">
            <MetaMaskConnect
              onConnect={connectWallet}
              connecting={connecting}
              error={error}
              requiredAddress={INSPECTOR_ADDRESS}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navigation />
      <div className="container mx-auto p-4 pt-20">
        <h1 className="text-3xl font-bold mb-6">Trang Kiểm Định Xe</h1>
        
        {/* Thông tin tài khoản */}
        <div className="bg-green-50 p-6 rounded-lg mb-6">
          <h2 className="text-xl font-semibold mb-2">Thông tin Inspector</h2>
          <p><span className="font-medium">Địa chỉ:</span> <span className="font-mono">{account}</span></p>
          <p><span className="font-medium">Số dư:</span> {balance} ETH</p>
          <p><span className="font-medium">Mạng:</span> {network}</p>
          <div className="mt-2 flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-sm text-green-700">Đã xác thực là Inspector</span>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Nút thêm hợp đồng thủ công */}
        <div className="mb-6">
          <Button onClick={addManualContract} variant="outline">
            Thêm hợp đồng cần kiểm định
          </Button>
        </div>

        {/* Danh sách hợp đồng chờ kiểm định */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Danh sách xe chờ kiểm định</h2>
            <Button onClick={loadPendingInspections} disabled={loading}>
              {loading ? 'Đang tải...' : 'Làm mới'}
            </Button>
          </div>
          
          {pendingInspections.length === 0 ? (
            <div className="bg-white p-6 rounded-lg shadow text-center">
              <p className="text-gray-500">Không có xe nào chờ kiểm định</p>
              <p className="text-sm text-gray-400 mt-2">
                Sử dụng nút "Thêm hợp đồng cần kiểm định" để thêm hợp đ��ng thủ công
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {pendingInspections.map((inspection) => {
                const contractAddress = inspection.contractAddress;
                const contractInfo = inspection.contractInfo;
                const currentData = inspectionData[contractAddress] || { isDamaged: false, compensation: '0' };
                
                return (
                  <div key={contractAddress} className="bg-white p-6 rounded-lg shadow-lg">
                    <div className="mb-4">
                      <h3 className="text-lg font-semibold">Hợp đồng: {contractAddress}</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                        <div>
                          <h4 className="font-medium text-gray-700">Thông tin xe</h4>
                          <p>{contractInfo.car.make} {contractInfo.car.model} ({contractInfo.car.year})</p>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-700">Bên thuê</h4>
                          <p className="font-mono text-sm">{contractInfo.lessee}</p>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-700">Thời gian trả xe</h4>
                          <p>{contractInfo.returnTime > 0 ? new Date(contractInfo.returnTime * 1000).toLocaleString() : 'Chưa xác định'}</p>
                        </div>
                      </div>
                    </div>

                    {/* Form kiểm định */}
                    <div className="border-t pt-4">
                      <h4 className="font-semibold mb-4">Kết quả kiểm định</h4>
                      
                      <div className="space-y-4">
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id={`damaged-${contractAddress}`}
                            checked={currentData.isDamaged}
                            onChange={(e) => updateInspectionData(contractAddress, 'isDamaged', e.target.checked)}
                            className="h-4 w-4"
                          />
                          <label htmlFor={`damaged-${contractAddress}`} className="text-sm font-medium">
                            Xe bị hư hại
                          </label>
                        </div>
                        
                        {currentData.isDamaged && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Chi phí bồi thường (ETH)
                            </label>
                            <input
                              type="number"
                              value={currentData.compensation}
                              onChange={(e) => updateInspectionData(contractAddress, 'compensation', e.target.value)}
                              step="0.001"
                              min="0"
                              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                              placeholder="Nhập số tiền bồi thường..."
                            />
                          </div>
                        )}
                        
                        <div className="flex gap-4">
                          <Button
                            onClick={() => handleInspection(contractAddress)}
                            disabled={loading}
                            className="flex-1"
                          >
                            {loading ? 'Đang xử lý...' : 'Xác nhận kiểm định'}
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Thông tin bổ sung */}
                    <div className="border-t pt-4 mt-4">
                      <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                        <div>
                          <span className="font-medium">Tiền đặt cọc:</span> {contractInfo.rental.depositAmount} ETH
                        </div>
                        <div>
                          <span className="font-medium">Số dư hợp đồng:</span> {contractInfo.balance} ETH
                        </div>
                        <div>
                          <span className="font-medium">Thời hạn thuê:</span> {contractInfo.rental.rentalDuration} ngày
                        </div>
                        <div>
                          <span className="font-medium">Giá thuê/ngày:</span> {contractInfo.rental.pricePerDay} ETH
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
