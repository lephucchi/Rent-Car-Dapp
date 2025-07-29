import React from 'react';
import { Car, Clock, Shield, User, DollarSign, Calendar } from 'lucide-react';
import { rentalContractService } from '../services/rentalContractService';

interface CarData {
  id: string;
  assetName: string;
  rentalFeePerDay: string;
  insuranceFee: string;
  durationDays: number;
  isRented: boolean;
  lessor: string;
  lessee?: string;
  status: 'Available' | 'Rented' | 'Awaiting Return Confirmation' | 'Damaged';
  depositRequired?: string;
  totalRentalFee?: string;
}

interface CarCardProps {
  car: CarData;
  userRole: 'lessor' | 'inspector' | 'lessee' | 'other';
  onRentCar?: (carId: string) => void;
  onManageCar?: (carId: string) => void;
  onInspectCar?: (carId: string) => void;
  isPreview?: boolean;
}

export const CarCard: React.FC<CarCardProps> = ({
  car,
  userRole,
  onRentCar,
  onManageCar,
  onInspectCar,
  isPreview = false
}) => {
  const getStatusColor = () => {
    switch (car.status) {
      case 'Available':
        return 'status-indicator status-active';
      case 'Rented':
        return 'status-indicator status-pending';
      case 'Awaiting Return Confirmation':
        return 'status-indicator status-pending';
      case 'Damaged':
        return 'status-indicator status-error';
      default:
        return 'status-indicator status-inactive';
    }
  };

  const getActionButton = () => {
    if (isPreview) {
      if (userRole === 'lessor') {
        return (
          <button className="luxury-button w-full" disabled>
            <Shield className="w-4 h-4 mr-2" />
            Manage Car (Preview)
          </button>
        );
      } else if (userRole === 'inspector' && car.status === 'Awaiting Return Confirmation') {
        return (
          <button className="luxury-button w-full" disabled>
            <Calendar className="w-4 h-4 mr-2" />
            Inspect Car (Preview)
          </button>
        );
      } else if (car.status === 'Available') {
        return (
          <button className="ferrari-button w-full" disabled>
            <Car className="w-4 h-4 mr-2" />
            Rent Car (Preview)
          </button>
        );
      }
      return null;
    }

    // Real action buttons
    if (userRole === 'lessor') {
      return (
        <button 
          onClick={() => onManageCar?.(car.id)}
          className="luxury-button w-full"
        >
          <Shield className="w-4 h-4 mr-2" />
          Manage Car
        </button>
      );
    } else if (userRole === 'inspector' && car.status === 'Awaiting Return Confirmation') {
      return (
        <button 
          onClick={() => onInspectCar?.(car.id)}
          className="luxury-button w-full"
        >
          <Calendar className="w-4 h-4 mr-2" />
          Inspect Car
        </button>
      );
    } else if (car.status === 'Available') {
      return (
        <button 
          onClick={() => onRentCar?.(car.id)}
          className="ferrari-button w-full"
        >
          <Car className="w-4 h-4 mr-2" />
          Rent Car
        </button>
      );
    }

    return null;
  };

  return (
    <div className="luxury-card p-6 hover:shadow-lg transition-all duration-300">
      {/* Car Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 ferrari-gradient rounded-lg flex items-center justify-center">
            <Car className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">{car.assetName}</h3>
            <div className={getStatusColor()}>
              {car.status}
            </div>
          </div>
        </div>
      </div>

      {/* Car Details */}
      <div className="space-y-3 mb-6">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground flex items-center">
            <DollarSign className="w-4 h-4 mr-1" />
            Daily Rate
          </span>
          <span className="font-semibold">
            {rentalContractService.formatEther(car.rentalFeePerDay)} ETH
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-muted-foreground flex items-center">
            <Shield className="w-4 h-4 mr-1" />
            Insurance
          </span>
          <span className="font-semibold">
            {rentalContractService.formatEther(car.insuranceFee)} ETH
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-muted-foreground flex items-center">
            <Clock className="w-4 h-4 mr-1" />
            Duration
          </span>
          <span className="font-semibold">
            {car.durationDays} days
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-muted-foreground flex items-center">
            <User className="w-4 h-4 mr-1" />
            Owner
          </span>
          <span className="font-mono text-sm">
            {car.lessor.slice(0, 6)}...{car.lessor.slice(-4)}
          </span>
        </div>

        {car.isRented && car.lessee && (
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground flex items-center">
              <User className="w-4 h-4 mr-1" />
              Renter
            </span>
            <span className="font-mono text-sm">
              {car.lessee.slice(0, 6)}...{car.lessee.slice(-4)}
            </span>
          </div>
        )}
      </div>

      {/* Rental Pricing (for Available cars) */}
      {car.status === 'Available' && car.depositRequired && car.totalRentalFee && (
        <div className="bg-muted/30 rounded-lg p-4 mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-muted-foreground">Deposit Required:</span>
            <span className="font-semibold text-foreground">
              {rentalContractService.formatEther(car.depositRequired)} ETH
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Total Rental Fee:</span>
            <span className="font-semibold text-foreground">
              {rentalContractService.formatEther(car.totalRentalFee)} ETH
            </span>
          </div>
        </div>
      )}

      {/* Action Button */}
      {getActionButton()}
    </div>
  );
};

export default CarCard;
