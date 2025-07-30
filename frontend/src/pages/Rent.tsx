import React from 'react';
import { RentalDashboard } from '../components/RentalDashboard';

export default function Rent() {
  return (
    <div className="min-h-screen bg-background">
      <div className="luxury-container py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-light text-foreground mb-4">
            Rent a <span className="gradient-text-aurora">Vehicle</span>
          </h1>
          <p className="text-xl text-muted-foreground">
            Secure your rental with blockchain technology
          </p>
        </div>

        {/* Main Rental Interface */}
        <RentalDashboard />
      </div>
    </div>
  );
}