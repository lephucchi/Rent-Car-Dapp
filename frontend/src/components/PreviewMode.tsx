import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface PreviewModeProps {
  children: React.ReactNode;
  previewData?: any;
}

export const PreviewMode: React.FC<PreviewModeProps> = ({ children, previewData }) => {
  const [isPreview, setIsPreview] = useState(false);

  if (isPreview) {
    return (
      <div className="relative">
        {/* Preview Banner */}
        <div className="bg-blue-100 border border-blue-300 text-blue-800 px-4 py-2 rounded-t-lg flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Eye className="w-4 h-4" />
            <span className="font-medium">Preview Mode</span>
            <span className="text-sm">- Viewing UI with mock data</span>
          </div>
          <button
            onClick={() => setIsPreview(false)}
            className="flex items-center space-x-1 text-blue-600 hover:text-blue-800 text-sm"
          >
            <EyeOff className="w-4 h-4" />
            <span>Exit Preview</span>
          </button>
        </div>
        
        {/* Preview Content with mock data overlay */}
        <div className="relative border border-blue-300 rounded-b-lg">
          <div className="absolute inset-0 bg-blue-50 opacity-10 pointer-events-none z-10"></div>
          <div className="relative z-0">
            {children}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Preview Toggle Button */}
      <div className="absolute top-4 right-4 z-50">
        <button
          onClick={() => setIsPreview(true)}
          className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm shadow-lg transition-colors"
        >
          <Eye className="w-4 h-4" />
          <span>Preview UI</span>
        </button>
      </div>
      {children}
    </div>
  );
};

// Mock data provider for preview mode
export const createMockContractData = () => ({
  assetName: "Tesla Model 3",
  lessor: "0x1234567890123456789012345678901234567890",
  lessee: "0x0987654321098765432109876543210987654321",
  damageAssessor: "0x1111222233334444555566667777888899990000",
  rentalFeePerDay: "1000000000000000000", // 1 ETH in wei
  durationDays: 7,
  insuranceFee: "500000000000000000", // 0.5 ETH in wei
  isRented: true,
  isDamaged: false,
  startTime: Date.now() - 86400000, // 1 day ago
  actualDays: 0,
  renterRequestedReturn: false,
  ownerConfirmedReturn: false,
  assessedDamageAmount: "0",
  balance: "2500000000000000000" // 2.5 ETH in wei
});

export default PreviewMode;
