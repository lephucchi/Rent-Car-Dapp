import { useState } from "react";
import { motion } from "framer-motion";
import {
  Car,
  Calendar,
  Clock,
  MapPin,
  User,
  ArrowRight,
  CheckCircle,
} from "lucide-react";
import Navigation from "../components/Navigation";
import Button from "../components/Button";
import { useWeb3Store } from "../stores/web3Store";

interface RentalContract {
  id: string;
  carName: string;
  carImage: string;
  owner: string;
  renter: string;
  startDate: string;
  endDate: string;
  pricePerDay: number;
  totalCost: number;
  status: "active" | "pending_return" | "completed";
  location: string;
  contractAddress: string;
}

export default function ActiveRentals() {
  const [loading, setLoading] = useState(false);
  const { isConnected, address } = useWeb3Store();

  // Mock data for active rentals
  const [rentals] = useState<RentalContract[]>([
    {
      id: "1",
      carName: "Tesla Model S",
      carImage:
        "https://images.pexels.com/photos/14487781/pexels-photo-14487781.jpeg",
      owner: "0x1234567890abcdef1234567890abcdef12345678",
      renter: "0xabcdef1234567890abcdef1234567890abcdef12",
      startDate: "2024-01-15",
      endDate: "2024-01-20",
      pricePerDay: 0.2,
      totalCost: 1.0,
      status: "active",
      location: "San Francisco, CA",
      contractAddress: "0xcontract123456789",
    },
    {
      id: "2",
      carName: "BMW M3 Competition",
      carImage:
        "https://images.pexels.com/photos/3802510/pexels-photo-3802510.jpeg",
      owner: "0x9876543210fedcba9876543210fedcba98765432",
      renter: "0xfedcba9876543210fedcba9876543210fedcba98",
      startDate: "2024-01-18",
      endDate: "2024-01-22",
      pricePerDay: 0.15,
      totalCost: 0.6,
      status: "pending_return",
      location: "Los Angeles, CA",
      contractAddress: "0xcontract987654321",
    },
  ]);

  const handleReturnCar = async (rentalId: string) => {
    setLoading(true);
    // Simulate blockchain transaction
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setLoading(false);
    alert(`Return process initiated for rental ${rentalId}`);
  };

  const handleConfirmReturn = async (rentalId: string) => {
    setLoading(true);
    // Simulate blockchain transaction
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setLoading(false);
    alert(`Return confirmed for rental ${rentalId}`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "text-green-400 bg-green-400/10 border-green-400/30";
      case "pending_return":
        return "text-yellow-400 bg-yellow-400/10 border-yellow-400/30";
      case "completed":
        return "text-gray-400 bg-gray-400/10 border-gray-400/30";
      default:
        return "text-gray-400 bg-gray-400/10 border-gray-400/30";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "active":
        return "Active Rental";
      case "pending_return":
        return "Pending Return";
      case "completed":
        return "Completed";
      default:
        return "Unknown";
    }
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="pt-20 pb-16 min-h-screen flex items-center justify-center">
          <div className="text-center space-y-6">
            <Car className="w-16 h-16 text-neon-cyan mx-auto" />
            <h2 className="text-2xl font-bold text-white">
              Connect Your Wallet
            </h2>
            <p className="text-gray-400 max-w-md">
              Please connect your wallet to view your active car rentals.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="pt-20 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Active{" "}
              <span className="bg-gradient-to-r from-neon-cyan to-neon-purple bg-clip-text text-transparent">
                Rentals
              </span>
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Manage your current car rentals and smart contracts
            </p>
          </motion.div>

          {/* Stats Overview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
          >
            <div className="glass rounded-xl p-6 text-center">
              <Car className="w-8 h-8 text-neon-cyan mx-auto mb-3" />
              <div className="text-2xl font-bold text-white">
                {rentals.filter((r) => r.status === "active").length}
              </div>
              <div className="text-gray-400">Active Rentals</div>
            </div>
            <div className="glass rounded-xl p-6 text-center">
              <Clock className="w-8 h-8 text-neon-purple mx-auto mb-3" />
              <div className="text-2xl font-bold text-white">
                {rentals.filter((r) => r.status === "pending_return").length}
              </div>
              <div className="text-gray-400">Pending Returns</div>
            </div>
            <div className="glass rounded-xl p-6 text-center">
              <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-3" />
              <div className="text-2xl font-bold text-white">
                {rentals.reduce((sum, r) => sum + r.totalCost, 0).toFixed(2)}
              </div>
              <div className="text-gray-400">Total ETH Spent</div>
            </div>
          </motion.div>

          {/* Rentals List */}
          {rentals.length > 0 ? (
            <div className="space-y-6">
              {rentals.map((rental, index) => (
                <motion.div
                  key={rental.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  className="glass rounded-xl p-6 hover:bg-white/5 transition-colors"
                >
                  <div className="flex flex-col lg:flex-row gap-6">
                    {/* Car Image & Basic Info */}
                    <div className="flex flex-col sm:flex-row gap-4 flex-1">
                      <img
                        src={rental.carImage}
                        alt={rental.carName}
                        className="w-full sm:w-32 h-32 object-cover rounded-lg"
                      />

                      <div className="flex-1 space-y-2">
                        <div className="flex items-center justify-between">
                          <h3 className="text-xl font-semibold text-white">
                            {rental.carName}
                          </h3>
                          <span
                            className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(rental.status)}`}
                          >
                            {getStatusText(rental.status)}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                          <div className="flex items-center space-x-2 text-gray-400">
                            <MapPin className="w-4 h-4" />
                            <span>{rental.location}</span>
                          </div>
                          <div className="flex items-center space-x-2 text-gray-400">
                            <User className="w-4 h-4" />
                            <span>
                              Owner: {rental.owner.slice(0, 6)}...
                              {rental.owner.slice(-4)}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2 text-gray-400">
                            <Calendar className="w-4 h-4" />
                            <span>
                              {rental.startDate} - {rental.endDate}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2 text-gray-400">
                            <span className="text-neon-cyan">
                              {rental.totalCost} ETH
                            </span>
                            <span>({rental.pricePerDay} ETH/day)</span>
                          </div>
                        </div>

                        <div className="text-xs text-gray-500 font-mono">
                          Contract: {rental.contractAddress}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col justify-center space-y-3 min-w-[200px]">
                      {rental.status === "active" && (
                        <>
                          <Button
                            onClick={() => handleReturnCar(rental.id)}
                            loading={loading}
                            variant="outline"
                            size="sm"
                          >
                            <ArrowRight className="w-4 h-4" />
                            Return Car
                          </Button>
                          <Button variant="ghost" size="sm">
                            View Contract
                          </Button>
                        </>
                      )}

                      {rental.status === "pending_return" && (
                        <>
                          <Button
                            onClick={() => handleConfirmReturn(rental.id)}
                            loading={loading}
                            size="sm"
                          >
                            <CheckCircle className="w-4 h-4" />
                            Confirm Return
                          </Button>
                          <Button variant="ghost" size="sm">
                            View Details
                          </Button>
                        </>
                      )}

                      {rental.status === "completed" && (
                        <Button variant="ghost" size="sm">
                          View Receipt
                        </Button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 glass rounded-xl">
              <Car className="w-16 h-16 text-gray-500 mx-auto mb-4" />
              <h3 className="text-2xl font-semibold text-gray-300 mb-2">
                No Active Rentals
              </h3>
              <p className="text-gray-500 mb-6">
                You don't have any active car rentals at the moment
              </p>
              <Button>Browse Available Cars</Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
