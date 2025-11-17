import { Shield, Clock, CreditCard, Wallet } from 'lucide-react';
import { useWalletConnection } from '../stores/globalWeb3Store';

export default function Landing() {
  const { isConnected, connectWallet } = useWalletConnection();

  if (isConnected) {
    return (
      <div>
        <meta httpEquiv="refresh" content="0; url=/" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="luxury-section">
        <div className="luxury-container">
          <div className="text-center">
            <h1 className="luxury-heading mb-6">
              CarDapp
              <br />
              <span className="gradient-text-aurora">Blockchain Car Rental</span>
            </h1>
            <p className="luxury-subheading max-w-3xl mx-auto mb-12">
              Experience the future of car rental with blockchain security.
              Connect your wallet to rent luxury vehicles with transparent pricing and instant confirmations.
            </p>
            
            <div className="luxury-card p-8 max-w-4xl mx-auto mb-12">
              <div className="luxury-grid-3">
                <div className="text-center">
                  <Shield className="w-12 h-12 text-primary mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">Smart Contract Security</h3>
                  <p className="text-muted-foreground">All transactions secured by Ethereum smart contracts</p>
                </div>
                <div className="text-center">
                  <Clock className="w-12 h-12 text-primary mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">Instant Booking</h3>
                  <p className="text-muted-foreground">Pay 30% deposit and start renting immediately</p>
                </div>
                <div className="text-center">
                  <CreditCard className="w-12 h-12 text-primary mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">Transparent Pricing</h3>
                  <p className="text-muted-foreground">All fees calculated on-chain with no hidden costs</p>
                </div>
              </div>
            </div>

            <div className="text-center">
              <button
                onClick={connectWallet}
                className="aurora-button w-full max-w-md mx-auto"
              >
                <Wallet className="w-4 h-4 mr-2" />
                Connect MetaMask Wallet
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="bg-muted/30 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-light text-foreground mb-4">How CarDapp Works</h2>
            <p className="text-xl text-muted-foreground">Complete user flow for all roles</p>
          </div>
          
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">1</div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Connect Wallet</h3>
              <p className="text-muted-foreground">MetaMask detects your role: User, Owner, or Inspector</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">2</div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Pay 30% Deposit</h3>
              <p className="text-muted-foreground">Secure your rental with smart contract deposit</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">3</div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Pickup at Station</h3>
              <p className="text-muted-foreground">Get your car from designated rental station</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">4</div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Return & Pay</h3>
              <p className="text-muted-foreground">Return car, complete remaining payment</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="luxury-section">
        <div className="luxury-container text-center">
          <h2 className="text-3xl font-light text-foreground mb-6">Ready to Start?</h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Connect your MetaMask wallet to browse available cars, manage your rentals, or list your vehicles on CarDapp.
          </p>
          <button
            onClick={connectWallet}
            className="ferrari-button inline-flex items-center"
          >
            <Wallet className="w-5 h-5 mr-2" />
            Connect Wallet Now
          </button>
        </div>
      </section>
    </div>
  );
}
