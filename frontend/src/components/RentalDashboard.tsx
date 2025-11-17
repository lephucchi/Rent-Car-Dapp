import { Car, AlertCircle } from 'lucide-react';

export const RentalDashboard = () => {
  return (
    <div className="luxury-card p-12 text-center">
      <Car className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
      <h3 className="text-xl font-semibold text-foreground mb-2">Available Rentals</h3>
      <p className="text-muted-foreground mb-6">
        Loading rental information from blockchain... 
        Make sure your wallet is connected to the correct network.
      </p>
      <button className="aurora-button">
        <AlertCircle className="w-4 h-4 mr-2" />
        Check Network Connection
      </button>
    </div>
  );
};
