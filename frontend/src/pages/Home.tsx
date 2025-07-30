import React from 'react';
import { Car, Shield, Clock, CreditCard, Users, Globe, Zap } from 'lucide-react';
import { RentalDashboard } from '../components/RentalDashboard';

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <div className="luxury-container py-8">
        {/* Hero Section */}
        <section className="text-center mb-12">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-light text-foreground mb-6">
              The Future of
              <br />
              <span className="gradient-text-aurora">Car Rental</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
              Experience blockchain-powered car rentals with transparent pricing, 
              instant confirmations, and secure smart contract automation.
            </p>
          </div>

          {/* Key Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto mb-12">
            <div className="text-center">
              <div className="w-16 h-16 aurora-gradient rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold mb-2">100% Secure</h3>
              <p className="text-muted-foreground text-sm">
                Smart contracts ensure transparent and secure transactions
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 cyan-gradient rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Instant Booking</h3>
              <p className="text-muted-foreground text-sm">
                Book and start your rental in under 30 seconds
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 aurora-gradient rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Globe className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Global Access</h3>
              <p className="text-muted-foreground text-sm">
                Available 24/7 worldwide with cryptocurrency payments
              </p>
            </div>
          </div>
        </section>

        {/* Main Rental Interface */}
        <section className="mb-12">
          <RentalDashboard />
        </section>

        {/* How It Works */}
        <section className="luxury-card p-8 mb-12">
          <h2 className="text-2xl font-light text-foreground text-center mb-8">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-blue-600 dark:text-blue-400 font-bold">1</span>
              </div>
              <h4 className="font-medium mb-2">Connect Wallet</h4>
              <p className="text-sm text-muted-foreground">
                Connect your MetaMask wallet to access the platform
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-green-600 dark:text-green-400 font-bold">2</span>
              </div>
              <h4 className="font-medium mb-2">Pay Deposit</h4>
              <p className="text-sm text-muted-foreground">
                Pay 50% deposit to secure your rental booking
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-purple-600 dark:text-purple-400 font-bold">3</span>
              </div>
              <h4 className="font-medium mb-2">Use Vehicle</h4>
              <p className="text-sm text-muted-foreground">
                Enjoy your rental for the agreed duration
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-orange-600 dark:text-orange-400 font-bold">4</span>
              </div>
              <h4 className="font-medium mb-2">Complete Payment</h4>
              <p className="text-sm text-muted-foreground">
                Return vehicle and complete final payment
              </p>
            </div>
          </div>
        </section>

        {/* Benefits */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="luxury-card p-6">
            <h3 className="text-xl font-semibold mb-4">For Renters</h3>
            <ul className="space-y-3">
              <li className="flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span>No credit checks required</span>
              </li>
              <li className="flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span>Transparent pricing with no hidden fees</span>
              </li>
              <li className="flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span>Instant booking and payment</span>
              </li>
              <li className="flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span>Secure deposit protection</span>
              </li>
            </ul>
          </div>

          <div className="luxury-card p-6">
            <h3 className="text-xl font-semibold mb-4">For Vehicle Owners</h3>
            <ul className="space-y-3">
              <li className="flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span>Earn passive income from your vehicle</span>
              </li>
              <li className="flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span>Smart contract protection</span>
              </li>
              <li className="flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span>Automated payment processing</span>
              </li>
              <li className="flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span>Damage compensation coverage</span>
              </li>
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
}

function CheckCircle({ className }: { className: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  );
}