import { ethers } from 'ethers';

export interface MockCar {
  id: string;
  assetName: string;
  rentalFeePerDay: string; // Wei format
  insuranceFee: string; // Wei format
  durationDays: number;
  isRented: boolean;
  lessor: string;
  lessee?: string;
  status: 'Available' | 'Rented' | 'Awaiting Return Confirmation' | 'Damaged';
  depositRequired?: string; // Wei format
  totalRentalFee?: string; // Wei format
}

export interface MockTransactionEvent {
  id: string;
  eventName: string;
  carId: string;
  carName: string;
  timestamp: Date;
  from: string;
  to?: string;
  amount?: string;
  blockHash: string;
  transactionHash: string;
}

class MockDataService {
  private mockCars: MockCar[] = [
    {
      id: '1',
      assetName: 'Tesla Model S',
      rentalFeePerDay: ethers.parseEther('1.0').toString(), // 1 ETH per day
      insuranceFee: ethers.parseEther('0.5').toString(), // 0.5 ETH insurance
      durationDays: 7,
      isRented: false,
      lessor: '0x1234567890123456789012345678901234567890',
      status: 'Available',
      depositRequired: ethers.parseEther('1.5').toString(), // 1.5 ETH deposit
      totalRentalFee: ethers.parseEther('7.0').toString(), // 7 ETH total
    },
    {
      id: '2',
      assetName: 'BMW X5',
      rentalFeePerDay: ethers.parseEther('0.8').toString(),
      insuranceFee: ethers.parseEther('0.4').toString(),
      durationDays: 5,
      isRented: true,
      lessor: '0x1234567890123456789012345678901234567890',
      lessee: '0x0987654321098765432109876543210987654321',
      status: 'Rented',
    },
    {
      id: '3',
      assetName: 'Audi A8',
      rentalFeePerDay: ethers.parseEther('1.2').toString(),
      insuranceFee: ethers.parseEther('0.6').toString(),
      durationDays: 3,
      isRented: false,
      lessor: '0x1111222233334444555566667777888899990000',
      status: 'Awaiting Return Confirmation',
    },
    {
      id: '4',
      assetName: 'Mercedes S-Class',
      rentalFeePerDay: ethers.parseEther('1.5').toString(),
      insuranceFee: ethers.parseEther('0.7').toString(),
      durationDays: 2,
      isRented: false,
      lessor: '0x2222333344445555666677778888999900001111',
      status: 'Available',
      depositRequired: ethers.parseEther('2.2').toString(),
      totalRentalFee: ethers.parseEther('3.0').toString(),
    },
    {
      id: '5',
      assetName: 'Ferrari 488',
      rentalFeePerDay: ethers.parseEther('3.0').toString(),
      insuranceFee: ethers.parseEther('1.5').toString(),
      durationDays: 1,
      isRented: false,
      lessor: '0x3333444455556666777788889999000011112222',
      status: 'Damaged',
    }
  ];

  private mockTransactions: MockTransactionEvent[] = [
    {
      id: '1',
      eventName: 'RentalStarted',
      carId: '2',
      carName: 'BMW X5',
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      from: '0x0987654321098765432109876543210987654321',
      amount: ethers.parseEther('1.2').toString(),
      blockHash: '0xabc123def456...',
      transactionHash: '0x123abc456def...'
    },
    {
      id: '2',
      eventName: 'RenterRequestedReturn',
      carId: '3',
      carName: 'Audi A8',
      timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
      from: '0x0987654321098765432109876543210987654321',
      blockHash: '0xdef456abc123...',
      transactionHash: '0x456def123abc...'
    },
    {
      id: '3',
      eventName: 'DamageReported',
      carId: '5',
      carName: 'Ferrari 488',
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
      from: '0x3333444455556666777788889999000011112222',
      blockHash: '0x789ghi012jkl...',
      transactionHash: '0x789ghi012jkl...'
    }
  ];

  // Get cars based on role
  getCarsForRole(role: 'admin' | 'inspector' | 'user'): MockCar[] {
    switch (role) {
      case 'admin':
        // Admin sees all cars they own
        return this.mockCars.filter(car => 
          car.lessor === '0x1234567890123456789012345678901234567890'
        );
      
      case 'inspector':
        // Inspector sees cars awaiting inspection
        return this.mockCars.filter(car => 
          car.status === 'Awaiting Return Confirmation' || car.status === 'Damaged'
        );
      
      case 'user':
      default:
        // Users see all available cars and their own rentals
        return this.mockCars.filter(car => 
          car.status === 'Available' || 
          car.lessee === '0x0987654321098765432109876543210987654321' // Current user mock address
        );
    }
  }

  // Get all cars
  getAllCars(): MockCar[] {
    return [...this.mockCars];
  }

  // Get available cars only
  getAvailableCars(): MockCar[] {
    return this.mockCars.filter(car => car.status === 'Available');
  }

  // Get cars owned by admin
  getOwnedCars(adminAddress: string): MockCar[] {
    return this.mockCars.filter(car => car.lessor.toLowerCase() === adminAddress.toLowerCase());
  }

  // Get cars for inspector
  getCarsForInspection(): MockCar[] {
    return this.mockCars.filter(car => 
      car.status === 'Awaiting Return Confirmation' || car.status === 'Damaged'
    );
  }

  // Get transaction events
  getTransactionEvents(): MockTransactionEvent[] {
    return [...this.mockTransactions].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  // Filter transactions by car
  getTransactionsByCar(carId: string): MockTransactionEvent[] {
    return this.mockTransactions.filter(tx => tx.carId === carId);
  }

  // Filter transactions by address
  getTransactionsByAddress(address: string): MockTransactionEvent[] {
    return this.mockTransactions.filter(tx => 
      tx.from.toLowerCase() === address.toLowerCase() || 
      tx.to?.toLowerCase() === address.toLowerCase()
    );
  }

  // Filter transactions by date range
  getTransactionsByDateRange(startDate: Date, endDate: Date): MockTransactionEvent[] {
    return this.mockTransactions.filter(tx => 
      tx.timestamp >= startDate && tx.timestamp <= endDate
    );
  }

  // Get admin statistics
  getAdminStatistics() {
    const totalCars = this.mockCars.length;
    const activeCars = this.mockCars.filter(car => car.isRented).length;
    const availableCars = this.mockCars.filter(car => car.status === 'Available').length;
    const totalRevenue = this.mockTransactions
      .filter(tx => tx.eventName === 'FundsTransferred')
      .reduce((sum, tx) => sum + parseFloat(ethers.formatEther(tx.amount || '0')), 0);

    return {
      totalCars,
      activeCars,
      availableCars,
      awaitingInspection: this.mockCars.filter(car => car.status === 'Awaiting Return Confirmation').length,
      damagedCars: this.mockCars.filter(car => car.status === 'Damaged').length,
      totalRevenue
    };
  }

  // Simulate adding a new car
  addCar(carData: Omit<MockCar, 'id' | 'status' | 'isRented'>): MockCar {
    const newCar: MockCar = {
      ...carData,
      id: String(this.mockCars.length + 1),
      status: 'Available',
      isRented: false
    };
    
    this.mockCars.push(newCar);
    return newCar;
  }

  // Simulate updating car status
  updateCarStatus(carId: string, status: MockCar['status'], lessee?: string): boolean {
    const carIndex = this.mockCars.findIndex(car => car.id === carId);
    if (carIndex === -1) return false;

    this.mockCars[carIndex].status = status;
    this.mockCars[carIndex].isRented = status === 'Rented';
    
    if (lessee) {
      this.mockCars[carIndex].lessee = lessee;
    } else if (status === 'Available') {
      delete this.mockCars[carIndex].lessee;
    }

    return true;
  }

  // Simulate adding a transaction event
  addTransactionEvent(event: Omit<MockTransactionEvent, 'id' | 'timestamp' | 'blockHash' | 'transactionHash'>): MockTransactionEvent {
    const newEvent: MockTransactionEvent = {
      ...event,
      id: String(this.mockTransactions.length + 1),
      timestamp: new Date(),
      blockHash: `0x${Math.random().toString(16).substr(2, 32)}`,
      transactionHash: `0x${Math.random().toString(16).substr(2, 32)}`
    };

    this.mockTransactions.unshift(newEvent); // Add to beginning for newest first
    return newEvent;
  }

  // Utility function to format wei to ether
  formatEther(weiValue: string): string {
    return ethers.formatEther(weiValue);
  }
}

export const mockDataService = new MockDataService();
