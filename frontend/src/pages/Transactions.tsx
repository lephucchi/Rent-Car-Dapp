import React from 'react';
import { TransactionHistory } from '../components/TransactionHistory';

export default function Transactions() {
  return (
    <div className="min-h-screen bg-background">
      <div className="luxury-container py-8">
        <TransactionHistory />
      </div>
    </div>
  );
}
