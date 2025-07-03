import { useState, useEffect } from 'react';
import Button from '../components/Button';
import { web3Service, ContractStatus } from '../lib/web3';
import type { ContractInfo } from '../lib/web3';

interface ContractDetailsProps {
  contractAddress: string;
  account: string | null;
}

export default function ContractDetails({ contractAddress, account }: ContractDetailsProps) {
  const [contractInfo, setContractInfo] = useState<ContractInfo | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [compensationAmount, setCompensationAmount] = useState<string>('0');
  const [isDamaged, setIsDamaged] = useState<boolean>(false);
  const [actionLoading, setActionLoading] = useState<boolean>(false);

  useEffect(() => {
    loadContractInfo();
  }, [contractAddress]);

  async function loadContractInfo() {
    if (!contractAddress) return;
    
    try {
      setLoading(true);
      setError(null);
      const info = await web3Service.getContractInfo(contractAddress);
      setContractInfo(info);
    } catch (err) {
      console.error('Error loading contract info:', err);
      setError('Không thể tải thông tin hợp đồng');
    } finally {
      setLoading(false);
    }
  }

  async function handleActivateContract() {
    if (!contractAddress || !contractInfo) return;
    
    try {
      setActionLoading(true);
      setError(null);
      await web3Service.activateContract(contractAddress, contractInfo.rental.depositAmount);
      await loadContractInfo();
    } catch (err) {
      console.error('Error activating contract:', err);
      setError('Không thể kích hoạt hợp đồng');
    } finally {
      setActionLoading(false);
    }
  }

  async function handleReturnCar() {
    if (!contractAddress) return;
    
    try {
      setActionLoading(true);
      setError(null);
      await web3Service.returnCar(contractAddress);
      await loadContractInfo();
    } catch (err) {
      console.error('Error returning car:', err);
      setError('Không thể trả xe');
    } finally {
      setActionLoading(false);
    }
  }

  async function handleInspectCar() {
    if (!contractAddress) return;
    
    try {
      setActionLoading(true);
      setError(null);
      await web3Service.inspectCar(contractAddress, isDamaged, compensationAmount);
      await loadContractInfo();
    } catch (err) {
      console.error('Error inspecting car:', err);
      setError('Không thể kiểm tra xe');
    } finally {
      setActionLoading(false);
    }
  }

  async function handleFinalizeContract() {
    if (!contractAddress) return;
    
    try {
      setActionLoading(true);
      setError(null);
      await web3Service.finalizeContract(contractAddress);
      await loadContractInfo();
    } catch (err) {
      console.error('Error finalizing contract:', err);
      setError('Không thể hoàn tất hợp đồng');
    } finally {
      setActionLoading(false);
    }
  }

  async function handleCancelContract() {
    if (!contractAddress) return;
    
    try {
      setActionLoading(true);
      setError(null);
      await web3Service.cancelContract(contractAddress);
      await loadContractInfo();
    } catch (err) {
      console.error('Error canceling contract:', err);
      setError('Không thể hủy hợp đồng');
    } finally {
      setActionLoading(false);
    }
  }

  function getStatusText(status: ContractStatus) {
    switch (status) {
      case ContractStatus.Pending:
        return 'Chờ kích hoạt';
      case ContractStatus.Active:
        return 'Đang thuê';
      case ContractStatus.Returned:
        return 'Đã trả xe, chờ kiểm định';
      case ContractStatus.Completed:
        return 'Đã kiểm định, chờ hoàn tất';
      case ContractStatus.Canceled:
        return 'Đã hủy';
      default:
        return 'Không xác định';
    }
  }

  function renderActionButtons() {
    if (!contractInfo || !account) return null;
    
    const isLessor = account.toLowerCase() === contractInfo.lessor.toLowerCase();
    const isLessee = account.toLowerCase() === contractInfo.lessee.toLowerCase();
    const isInspector = account.toLowerCase() === contractInfo.inspector.toLowerCase();
    
    switch (contractInfo.status) {
      case ContractStatus.Pending:
        return (
          <div className="flex flex-col gap-2">
            {isLessee && (
              <Button
                onClick={handleActivateContract}
                disabled={actionLoading}
              >
                {actionLoading ? 'Đang xử lý...' : 'Kích hoạt hợp đồng'}
              </Button>
            )}
            <Button
              onClick={handleCancelContract}
              disabled={actionLoading}
              variant="outline"
            >
              {actionLoading ? 'Đang xử lý...' : 'Hủy hợp đồng'}
            </Button>
          </div>
        );
      
      case ContractStatus.Active:
        return isLessee ? (
          <Button
            onClick={handleReturnCar}
            disabled={actionLoading}
          >
            {actionLoading ? 'Đang xử lý...' : 'Trả xe'}
          </Button>
        ) : null;
      
      case ContractStatus.Returned:
        return isInspector ? (
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isDamaged"
                checked={isDamaged}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setIsDamaged(e.target.checked)}
                className="h-4 w-4"
              />
              <label htmlFor="isDamaged" className="text-sm">Xe bị hư hại</label>
            </div>
            
            {isDamaged && (
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Chi phí bồi thường (ETH)
                </label>
                <input
                  type="number"
                  value={compensationAmount}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCompensationAmount(e.target.value)}
                  step="0.001"
                  min="0"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
            )}
            
            <Button
              onClick={handleInspectCar}
              disabled={actionLoading}
            >
              {actionLoading ? 'Đang xử lý...' : 'Xác nhận kiểm tra'}
            </Button>
          </div>
        ) : null;
      
      case ContractStatus.Completed:
        return isLessor ? (
          <Button
            onClick={handleFinalizeContract}
            disabled={actionLoading}
          >
            {actionLoading ? 'Đang xử lý...' : 'Hoàn tất hợp đồng'}
          </Button>
        ) : null;
      
      default:
        return null;
    }
  }

  if (loading) {
    return <div className="text-center py-8">Đang tải thông tin hợp đồng...</div>;
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        {error}
      </div>
    );
  }

  if (!contractInfo) {
    return (
      <div className="text-center py-8">
        Không tìm thấy thông tin hợp đồng
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4">Chi tiết hợp đồng thuê xe</h2>
      <div className="mb-4">
        <p className="text-sm text-gray-500">Địa chỉ hợp đồng</p>
        <p className="font-mono">{contractAddress}</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="border p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Thông tin xe</h3>
          <p><span className="font-medium">Hãng xe:</span> {contractInfo.car.make}</p>
          <p><span className="font-medium">Model:</span> {contractInfo.car.model}</p>
          <p><span className="font-medium">Năm sản xuất:</span> {contractInfo.car.year}</p>
        </div>
        
        <div className="border p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Các bên</h3>
          <p><span className="font-medium">Bên cho thuê:</span> <span className="font-mono text-sm">{contractInfo.lessor}</span></p>
          <p><span className="font-medium">Bên thuê:</span> <span className="font-mono text-sm">{contractInfo.lessee || 'Chưa xác định'}</span></p>
          <p><span className="font-medium">Bên kiểm định:</span> <span className="font-mono text-sm">{contractInfo.inspector}</span></p>
        </div>
        
        <div className="border p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Điều kiện thuê</h3>
          <p><span className="font-medium">Giá thuê/ngày:</span> {contractInfo.rental.pricePerDay} ETH</p>
          <p><span className="font-medium">Thời hạn thuê:</span> {contractInfo.rental.rentalDuration} ngày</p>
          <p><span className="font-medium">Tiền đặt cọc:</span> {contractInfo.rental.depositAmount} ETH</p>
          <p><span className="font-medium">Phí trễ hạn/ngày:</span> {contractInfo.rental.latePenaltyRate} ETH</p>
          <p><span className="font-medium">Phí khấu hao/ngày:</span> {contractInfo.rental.earlyDepreciationRate} ETH</p>
        </div>
        
        <div className="border p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Trạng thái</h3>
          <p className="mb-2">
            <span className="font-medium">Trạng thái hiện tại:</span>{' '}
            <span className="inline-block px-2 py-1 rounded text-white bg-blue-500">
              {getStatusText(contractInfo.status)}
            </span>
          </p>
          <p><span className="font-medium">Thời điểm bắt đầu:</span> {contractInfo.startTime > 0 ? new Date(contractInfo.startTime * 1000).toLocaleString() : 'Chưa bắt đầu'}</p>
          <p><span className="font-medium">Thời hạn trả xe:</span> {contractInfo.dueTime > 0 ? new Date(contractInfo.dueTime * 1000).toLocaleString() : 'Chưa xác định'}</p>
          <p><span className="font-medium">Thời điểm trả xe:</span> {contractInfo.returnTime > 0 ? new Date(contractInfo.returnTime * 1000).toLocaleString() : 'Chưa trả xe'}</p>
        </div>

        {contractInfo.status >= ContractStatus.Returned && (
          <div className="border p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Kiểm định</h3>
            <p><span className="font-medium">Xe bị hư hại:</span> {contractInfo.isDamaged ? 'Có' : 'Không'}</p>
            {contractInfo.isDamaged && (
              <p><span className="font-medium">Chi phí bồi thường:</span> {contractInfo.compensationAmount} ETH</p>
            )}
          </div>
        )}
        
        <div className="border p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Tài chính</h3>
          <p><span className="font-medium">Số dư hợp đồng:</span> {contractInfo.balance} ETH</p>
        </div>
      </div>
      
      {renderActionButtons()}
    </div>
  );
}
