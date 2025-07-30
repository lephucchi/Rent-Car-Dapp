import React, { useState, useMemo } from 'react';
import { History, Filter, Download, Calendar, Car, User, Search, ChevronDown, X } from 'lucide-react';
import { usePreviewMode } from '../contexts/PreviewModeContext';
import { useGlobalWeb3Store, useWalletConnection, useUserRole as useGlobalUserRole } from '../stores/globalWeb3Store';
import { mockDataService, type MockTransactionEvent } from '../services/mockDataService';
import { ethers } from 'ethers';

interface FilterState {
  carId: string;
  eventType: string;
  walletAddress: string;
  dateFrom: string;
  dateTo: string;
}

const eventTypeColors = {
  'RentalStarted': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  'RenterRequestedReturn': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  'OwnerConfirmedReturn': 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  'DamageReported': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  'DamageAssessed': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  'FundsTransferred': 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
};

export default function Transaction() {
  const { isPreviewMode, simulatedRole } = usePreviewMode();
  const { isConnected, address, connectWallet } = useWalletConnection();
  const globalUserRole = useGlobalUserRole();
  const [filters, setFilters] = useState<FilterState>({
    carId: '',
    eventType: '',
    walletAddress: '',
    dateFrom: '',
    dateTo: ''
  });
  const [showFilters, setShowFilters] = useState(false);

  // Get all transaction events - MOVED BEFORE CONDITIONAL LOGIC
  const allTransactions = useMemo(() => {
    return mockDataService.getTransactionEvents();
  }, []);

  // Get available cars for filtering - MOVED BEFORE CONDITIONAL LOGIC
  const availableCars = useMemo(() => {
    return mockDataService.getAllCars();
  }, []);

  // Filter transactions
  const filteredTransactions = useMemo(() => {
    let filtered = [...allTransactions];

    if (filters.carId) {
      filtered = filtered.filter(tx => tx.carId === filters.carId);
    }

    if (filters.eventType) {
      filtered = filtered.filter(tx => tx.eventName === filters.eventType);
    }

    if (filters.walletAddress) {
      const address = filters.walletAddress.toLowerCase();
      filtered = filtered.filter(tx => 
        tx.from.toLowerCase().includes(address) || 
        tx.to?.toLowerCase().includes(address)
      );
    }

    if (filters.dateFrom) {
      const fromDate = new Date(filters.dateFrom);
      filtered = filtered.filter(tx => tx.timestamp >= fromDate);
    }

    if (filters.dateTo) {
      const toDate = new Date(filters.dateTo);
      toDate.setHours(23, 59, 59, 999); // End of day
      filtered = filtered.filter(tx => tx.timestamp <= toDate);
    }

    return filtered;
  }, [allTransactions, filters]);

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      carId: '',
      eventType: '',
      walletAddress: '',
      dateFrom: '',
      dateTo: ''
    });
  };

  const exportToCSV = () => {
    const headers = ['Event', 'Car', 'Date', 'From', 'To', 'Amount (ETH)', 'Transaction Hash'];
    const csvContent = [
      headers.join(','),
      ...filteredTransactions.map(tx => [
        tx.eventName,
        tx.carName,
        tx.timestamp.toISOString(),
        tx.from,
        tx.to || '',
        tx.amount ? ethers.formatEther(tx.amount) : '',
        tx.transactionHash
      ].map(field => `"${field}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transactions_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getEventIcon = (eventName: string) => {
    switch (eventName) {
      case 'RentalStarted':
        return <Car className="w-4 h-4" />;
      case 'RenterRequestedReturn':
      case 'OwnerConfirmedReturn':
        return <History className="w-4 h-4" />;
      case 'DamageReported':
      case 'DamageAssessed':
        return <X className="w-4 h-4" />;
      case 'FundsTransferred':
        return <Download className="w-4 h-4" />;
      default:
        return <History className="w-4 h-4" />;
    }
  };

  const hasActiveFilters = Object.values(filters).some(value => value !== '');

  return (
    <div className="min-h-screen bg-background">
      <div className="luxury-container py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-light text-foreground mb-2">Transaction History</h1>
            <p className="text-muted-foreground">
              {isPreviewMode ? 'Preview: Platform transaction activity' : 'Real-time platform transaction activity'}
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`luxury-button-outline ${hasActiveFilters ? 'bg-accent' : ''}`}
            >
              <Filter className="w-4 h-4 mr-2" />
              Filters {hasActiveFilters && `(${Object.values(filters).filter(v => v).length})`}
            </button>
            
            <button
              onClick={exportToCSV}
              className="luxury-button"
              disabled={filteredTransactions.length === 0}
            >
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </button>
          </div>
        </div>

        {/* Preview Mode Notice */}
        {isPreviewMode && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8 dark:bg-blue-900/30 dark:border-blue-800">
            <p className="text-blue-700 dark:text-blue-400 text-sm">
              🔍 Preview Mode: Showing sample transaction data. Real implementation would listen to blockchain events.
            </p>
          </div>
        )}

        {/* Filters Panel */}
        {showFilters && (
          <div className="luxury-card p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">Filter Transactions</h3>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  Clear All
                </button>
              )}
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Car Filter */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Car
                </label>
                <select
                  value={filters.carId}
                  onChange={(e) => handleFilterChange('carId', e.target.value)}
                  className="luxury-input w-full"
                >
                  <option value="">All Cars</option>
                  {availableCars.map(car => (
                    <option key={car.id} value={car.id}>
                      {car.assetName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Event Type Filter */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Event Type
                </label>
                <select
                  value={filters.eventType}
                  onChange={(e) => handleFilterChange('eventType', e.target.value)}
                  className="luxury-input w-full"
                >
                  <option value="">All Events</option>
                  <option value="RentalStarted">Rental Started</option>
                  <option value="RenterRequestedReturn">Return Requested</option>
                  <option value="OwnerConfirmedReturn">Return Confirmed</option>
                  <option value="DamageReported">Damage Reported</option>
                  <option value="DamageAssessed">Damage Assessed</option>
                  <option value="FundsTransferred">Funds Transferred</option>
                </select>
              </div>

              {/* Wallet Address Filter */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Wallet Address
                </label>
                <input
                  type="text"
                  value={filters.walletAddress}
                  onChange={(e) => handleFilterChange('walletAddress', e.target.value)}
                  placeholder="Search by address..."
                  className="luxury-input w-full"
                />
              </div>

              {/* Date From Filter */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  From Date
                </label>
                <input
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                  className="luxury-input w-full"
                />
              </div>

              {/* Date To Filter */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  To Date
                </label>
                <input
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                  className="luxury-input w-full"
                />
              </div>
            </div>
          </div>
        )}

        {/* Transaction List */}
        <div className="luxury-card">
          <div className="p-6 border-b border-border">
            <h2 className="text-xl font-semibold text-foreground">
              Transactions ({filteredTransactions.length})
            </h2>
          </div>

          {filteredTransactions.length > 0 ? (
            <div className="divide-y divide-border">
              {filteredTransactions.map((transaction) => (
                <div key={transaction.id} className="p-6 hover:bg-muted/30 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          eventTypeColors[transaction.eventName as keyof typeof eventTypeColors] || 'bg-gray-100 text-gray-800'
                        }`}>
                          {getEventIcon(transaction.eventName)}
                        </div>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold text-foreground">
                            {transaction.eventName.replace(/([A-Z])/g, ' $1').trim()}
                          </h3>
                          <span className={`status-indicator text-xs ${
                            eventTypeColors[transaction.eventName as keyof typeof eventTypeColors] || 'status-inactive'
                          }`}>
                            {transaction.eventName}
                          </span>
                        </div>
                        
                        <div className="space-y-1 text-sm text-muted-foreground">
                          <div className="flex items-center space-x-4">
                            <span className="flex items-center">
                              <Car className="w-4 h-4 mr-1" />
                              {transaction.carName}
                            </span>
                            <span className="flex items-center">
                              <Calendar className="w-4 h-4 mr-1" />
                              {formatDate(transaction.timestamp)}
                            </span>
                          </div>
                          
                          <div className="flex items-center space-x-4">
                            <span className="flex items-center">
                              <User className="w-4 h-4 mr-1" />
                              From: {transaction.from.slice(0, 8)}...{transaction.from.slice(-6)}
                            </span>
                            {transaction.to && (
                              <span className="flex items-center">
                                <User className="w-4 h-4 mr-1" />
                                To: {transaction.to.slice(0, 8)}...{transaction.to.slice(-6)}
                              </span>
                            )}
                          </div>
                          
                          <div className="font-mono text-xs">
                            Tx: {transaction.transactionHash.slice(0, 16)}...{transaction.transactionHash.slice(-8)}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      {transaction.amount && (
                        <div className="text-lg font-semibold text-foreground">
                          {ethers.formatEther(transaction.amount)} ETH
                        </div>
                      )}
                      <div className="text-xs text-muted-foreground mt-1">
                        Block: {transaction.blockHash.slice(0, 8)}...
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center">
              <History className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">
                {hasActiveFilters ? 'No Matching Transactions' : 'No Transactions Yet'}
              </h3>
              <p className="text-muted-foreground">
                {hasActiveFilters 
                  ? 'Try adjusting your filters to see more results.'
                  : 'Transaction activity will appear here as users interact with the platform.'
                }
              </p>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="luxury-button mt-4"
                >
                  Clear Filters
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
