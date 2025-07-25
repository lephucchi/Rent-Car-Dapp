import React, { useState } from 'react';
import { Button } from './Button';
import { Input } from './Input';

export const ContractDeployment: React.FC = () => {
  const [deploymentParams, setDeploymentParams] = useState({
    assetName: 'Tesla Model 3',
    rentalFeePerMinute: '1',
    durationMinutes: '60',
    insuranceFee: '10',
    insuranceCompensation: '50'
  });

  const handleParamChange = (field: string, value: string) => {
    setDeploymentParams(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const deploymentInstructions = `
To deploy a new rental contract:

1. Make sure you have Hardhat running locally:
   cd smartcontract
   npx hardhat node

2. Deploy the contract with your parameters:
   npx hardhat run scripts/deploy-carrental.js --network localhost

3. The contract will be deployed with these parameters:
   - Asset Name: ${deploymentParams.assetName}
   - Fee per minute: ${deploymentParams.rentalFeePerMinute} ETH
   - Duration: ${deploymentParams.durationMinutes} minutes
   - Insurance fee: ${deploymentParams.insuranceFee} ETH
   - Damage compensation: ${deploymentParams.insuranceCompensation} ETH

Example constructor call:
new FixedRentalContract(
  "${deploymentParams.assetName}",
  ${deploymentParams.rentalFeePerMinute},
  ${deploymentParams.durationMinutes},
  ${deploymentParams.insuranceFee},
  ${deploymentParams.insuranceCompensation}
)
  `;

  return (
    <div className="glass rounded-lg p-6">
      <h3 className="text-lg font-semibold gradient-text mb-6">Contract Deployment Helper</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h4 className="font-medium text-foreground">Deployment Parameters</h4>
          
          <Input
            label="Asset Name"
            value={deploymentParams.assetName}
            onChange={(e) => handleParamChange('assetName', e.target.value)}
            placeholder="e.g., Tesla Model 3"
          />
          
          <Input
            label="Rental Fee per Minute (ETH)"
            type="number"
            step="0.001"
            value={deploymentParams.rentalFeePerMinute}
            onChange={(e) => handleParamChange('rentalFeePerMinute', e.target.value)}
            placeholder="1"
          />
          
          <Input
            label="Duration (Minutes)"
            type="number"
            value={deploymentParams.durationMinutes}
            onChange={(e) => handleParamChange('durationMinutes', e.target.value)}
            placeholder="60"
          />
          
          <Input
            label="Insurance Fee (ETH)"
            type="number"
            step="0.001"
            value={deploymentParams.insuranceFee}
            onChange={(e) => handleParamChange('insuranceFee', e.target.value)}
            placeholder="10"
          />
          
          <Input
            label="Damage Compensation (ETH)"
            type="number"
            step="0.001"
            value={deploymentParams.insuranceCompensation}
            onChange={(e) => handleParamChange('insuranceCompensation', e.target.value)}
            placeholder="50"
          />
        </div>
        
        <div>
          <h4 className="font-medium text-foreground mb-4">Deployment Instructions</h4>
          <div className="glass-hover rounded-lg p-4">
            <pre className="text-xs text-muted-foreground whitespace-pre-wrap overflow-auto">
              {deploymentInstructions}
            </pre>
          </div>
        </div>
      </div>
      
      <div className="mt-6 p-4 glass-hover rounded-lg">
        <h4 className="font-medium text-foreground mb-2">Fee Calculation Preview</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Total Rental Fee:</span>
            <div className="text-foreground font-medium">
              {(parseFloat(deploymentParams.rentalFeePerMinute) * parseFloat(deploymentParams.durationMinutes) + parseFloat(deploymentParams.insuranceFee)).toFixed(3)} ETH
            </div>
          </div>
          <div>
            <span className="text-muted-foreground">Required Deposit (50%):</span>
            <div className="text-neon-cyan font-medium">
              {((parseFloat(deploymentParams.rentalFeePerMinute) * parseFloat(deploymentParams.durationMinutes) + parseFloat(deploymentParams.insuranceFee)) * 0.5).toFixed(3)} ETH
            </div>
          </div>
          <div>
            <span className="text-muted-foreground">Max Damage Cost:</span>
            <div className="text-red-400 font-medium">
              {deploymentParams.insuranceCompensation} ETH
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
