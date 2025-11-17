import { useState } from 'react';
import { Car, Plus, Loader } from 'lucide-react';
import { useWalletConnection } from '../stores/globalWeb3Store';
import { useAuthStore } from '../stores/authStore';
import carService, { type CreateCarData } from '../services/carService';
import { contractService } from '../services/contractService';
import { useNavigate } from 'react-router-dom';

export default function LendCar() {
  const { isConnected, address } = useWalletConnection();
  const { isAuthenticated, user } = useAuthStore();
  const navigate = useNavigate();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<CreateCarData & { duration_days: number }>({
    model: '',
    year: new Date().getFullYear(),
    license_plate: '',
    location: '',
    rental_fee_per_day: 0,
    insurance_fee: 0,
    description: '',
    duration_days: 7,
    images: []
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'year' || name === 'rental_fee_per_day' || name === 'insurance_fee' || name === 'duration_days'
        ? parseFloat(value) || 0
        : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsSubmitting(true);

    try {
      // Step 1: Create car
      const carResponse = await carService.createCar({
        model: formData.model,
        year: formData.year,
        license_plate: formData.license_plate,
        location: formData.location,
        rental_fee_per_day: formData.rental_fee_per_day,
        insurance_fee: formData.insurance_fee,
        description: formData.description,
        images: formData.images
      });

      if (!carResponse.success) {
        throw new Error(carResponse.message || 'Failed to create car');
      }

      // Step 2: Create contract
      const contractResponse = await contractService.createContract({
        car_id: carResponse.data.id,
        rental_fee_per_day: formData.rental_fee_per_day,
        duration_days: formData.duration_days,
        insurance_fee: formData.insurance_fee,
        notes: formData.description
      });

      if (!contractResponse.success) {
        throw new Error(contractResponse.message || 'Failed to create contract');
      }

      setSuccess(
        `Car registered successfully! Contract deployed at: ${contractResponse.data.deployment.contractAddress.slice(0, 10)}...`
      );

      // Reset form
      setTimeout(() => {
        navigate('/admin');
      }, 2000);

    } catch (err: any) {
      setError(err.message || 'Failed to register car');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="luxury-card p-8 max-w-md mx-auto text-center">
          <Car className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-foreground mb-4">Login Required</h2>
          <p className="text-muted-foreground mb-6">
            Please login to register and manage your cars.
          </p>
          <button onClick={() => navigate('/auth')} className="luxury-button">
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="luxury-card p-8 max-w-md mx-auto text-center">
          <Car className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-foreground mb-4">Connect Your Wallet</h2>
          <p className="text-muted-foreground mb-6">
            Connect your wallet to register and manage your cars.
          </p>
          <button onClick={() => navigate('/')} className="luxury-button">
            Go Back and Connect
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="luxury-container py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-light text-foreground mb-4">
            Register Your <span className="gradient-text-aurora">Vehicle</span>
          </h1>
          <p className="text-xl text-muted-foreground">
            List your car on CarDapp and start earning from rentals
          </p>
        </div>

        {/* Registration Form */}
        <div className="max-w-2xl mx-auto">
          {error && (
            <div className="mb-6 p-4 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-800 rounded-lg text-red-800 dark:text-red-200">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-800 rounded-lg text-green-800 dark:text-green-200">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="luxury-card p-8">
              <div className="space-y-6">
                {/* Car Model */}
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">
                    Car Model
                  </label>
                  <input
                    type="text"
                    name="model"
                    value={formData.model}
                    onChange={handleInputChange}
                    required
                    placeholder="e.g., BMW X5"
                    className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground"
                  />
                </div>

                {/* Year & License Plate */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">
                      Year
                    </label>
                    <input
                      type="number"
                      name="year"
                      value={formData.year}
                      onChange={handleInputChange}
                      required
                      min="2000"
                      max={new Date().getFullYear() + 1}
                      className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">
                      License Plate
                    </label>
                    <input
                      type="text"
                      name="license_plate"
                      value={formData.license_plate}
                      onChange={handleInputChange}
                      required
                      placeholder="ABC-1234"
                      className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground"
                    />
                  </div>
                </div>

                {/* Location */}
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">
                    Location
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    required
                    placeholder="City, Country"
                    className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground"
                  />
                </div>

                {/* Daily Rate & Insurance */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">
                      Daily Rate (USD)
                    </label>
                    <input
                      type="number"
                      name="rental_fee_per_day"
                      value={formData.rental_fee_per_day}
                      onChange={handleInputChange}
                      required
                      min="0"
                      step="0.01"
                      placeholder="50.00"
                      className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">
                      Insurance Fee (USD)
                    </label>
                    <input
                      type="number"
                      name="insurance_fee"
                      value={formData.insurance_fee}
                      onChange={handleInputChange}
                      required
                      min="0"
                      step="0.01"
                      placeholder="10.00"
                      className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground"
                    />
                  </div>
                </div>

                {/* Default Duration */}
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">
                    Default Rental Duration (Days)
                  </label>
                  <input
                    type="number"
                    name="duration_days"
                    value={formData.duration_days}
                    onChange={handleInputChange}
                    required
                    min="1"
                    placeholder="7"
                    className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Describe your vehicle features, condition, etc..."
                    rows={4}
                    className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground resize-none"
                  />
                </div>

                {/* Submit Button */}
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full luxury-button flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <Loader className="w-4 h-4 mr-2 animate-spin" />
                      Deploying Contract...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 mr-2" />
                      Register Vehicle & Deploy Contract
                    </>
                  )}
                </button>

                <p className="text-xs text-muted-foreground text-center">
                  By registering, a smart contract will be deployed to the blockchain
                </p>
              </div>
            </div>
          </form>

          {/* Info Section */}
          <div className="mt-8 grid md:grid-cols-3 gap-6">
            <div className="luxury-card p-6">
              <div className="w-12 h-12 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-4">
                <span className="text-lg font-bold text-green-600">✓</span>
              </div>
              <h3 className="font-semibold text-foreground mb-2">Easy Setup</h3>
              <p className="text-sm text-muted-foreground">Register your car in just a few minutes</p>
            </div>

            <div className="luxury-card p-6">
              <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-4">
                <span className="text-lg font-bold text-blue-600">💰</span>
              </div>
              <h3 className="font-semibold text-foreground mb-2">Earn Income</h3>
              <p className="text-sm text-muted-foreground">Get paid instantly when cars are rented</p>
            </div>

            <div className="luxury-card p-6">
              <div className="w-12 h-12 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mb-4">
                <span className="text-lg font-bold text-purple-600">🔒</span>
              </div>
              <h3 className="font-semibold text-foreground mb-2">Secure</h3>
              <p className="text-sm text-muted-foreground">Smart contracts protect your assets</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
