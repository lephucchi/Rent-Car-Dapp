import { useState } from "react";
import { motion } from "framer-motion";
import {
  User,
  Car,
  Calendar,
  TrendingUp,
  Wallet,
  Edit3,
  Camera,
} from "lucide-react";
import Navigation from "../components/Navigation";
import Button from "../components/Button";
import CarCard from "../components/CarCard";
import { useWeb3Store } from "../stores/web3Store";

export default function Profile() {
  const [activeTab, setActiveTab] = useState("lending");
  const { address, balance, isConnected } = useWeb3Store();

  // Mock data
  const userStats = {
    totalEarnings: "12.5",
    totalRentals: 8,
    activeRentals: 2,
    rating: 4.8,
    joinDate: "January 2024",
  };

  const lendingCars = [
    {
      id: "1",
      name: "Tesla Model S",
      image:
        "https://images.pexels.com/photos/14487781/pexels-photo-14487781.jpeg",
      location: "San Francisco",
      pricePerDay: 0.2,
      rating: 4.9,
      reviews: 24,
      fuelType: "Electric",
      seats: 5,
      year: 2023,
      brand: "Tesla",
      available: true,
    },
    {
      id: "2",
      name: "BMW M3",
      image:
        "https://images.pexels.com/photos/3802510/pexels-photo-3802510.jpeg",
      location: "Los Angeles",
      pricePerDay: 0.15,
      rating: 4.7,
      reviews: 18,
      fuelType: "Gasoline",
      seats: 4,
      year: 2022,
      brand: "BMW",
      available: false,
    },
  ];

  const borrowingCars = [
    {
      id: "3",
      name: "Audi A8",
      image:
        "https://images.pexels.com/photos/12715688/pexels-photo-12715688.jpeg",
      location: "Miami",
      pricePerDay: 0.18,
      rating: 4.8,
      reviews: 15,
      fuelType: "Hybrid",
      seats: 5,
      year: 2023,
      brand: "Audi",
      available: false,
      owner: "0x1234...5678",
    },
  ];

  const tabs = [
    { id: "lending", label: "My Cars", icon: Car, count: lendingCars.length },
    {
      id: "borrowing",
      label: "Renting",
      icon: Calendar,
      count: borrowingCars.length,
    },
  ];

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="pt-20 pb-16 min-h-screen flex items-center justify-center">
          <div className="text-center space-y-6">
            <Wallet className="w-16 h-16 text-neon-cyan mx-auto" />
            <h2 className="text-2xl font-bold text-white">
              Connect Your Wallet
            </h2>
            <p className="text-gray-400 max-w-md">
              Please connect your wallet to view your profile and manage your
              car rentals.
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
          {/* Profile Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass rounded-2xl p-8 mb-8"
          >
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between space-y-6 md:space-y-0">
              {/* Profile Info */}
              <div className="flex items-center space-x-6">
                <div className="relative">
                  <div className="w-20 h-20 bg-gradient-to-r from-neon-purple to-neon-cyan rounded-full flex items-center justify-center">
                    <User className="w-10 h-10 text-white" />
                  </div>
                  <button className="absolute -bottom-1 -right-1 w-6 h-6 bg-neon-cyan rounded-full flex items-center justify-center hover:bg-neon-purple transition-colors">
                    <Camera className="w-3 h-3 text-white" />
                  </button>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center space-x-3">
                    <h1 className="text-3xl font-bold text-white">
                      Your Profile
                    </h1>
                    <Button variant="ghost" size="sm">
                      <Edit3 className="w-4 h-4" />
                      Edit
                    </Button>
                  </div>
                  <p className="text-gray-400 font-mono">{address}</p>
                  <p className="text-sm text-gray-500">
                    Member since {userStats.joinDate}
                  </p>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-neon-cyan">
                    {userStats.totalEarnings}
                  </div>
                  <div className="text-sm text-gray-400">ETH Earned</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-neon-purple">
                    {userStats.totalRentals}
                  </div>
                  <div className="text-sm text-gray-400">Total Rentals</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">
                    {userStats.rating}
                  </div>
                  <div className="text-sm text-gray-400">Rating</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400">
                    {balance}
                  </div>
                  <div className="text-sm text-gray-400">ETH Balance</div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Tabs */}
          <div className="flex space-x-1 glass rounded-xl p-1 mb-8 w-fit">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-6 py-3 rounded-lg transition-all duration-200 ${
                    activeTab === tab.id
                      ? "bg-gradient-to-r from-neon-purple to-neon-cyan text-white"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{tab.label}</span>
                  <span className="bg-white/20 text-xs px-2 py-1 rounded-full">
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Tab Content */}
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === "lending" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-white">
                    Cars You're Lending
                  </h2>
                  <Button>Add New Car</Button>
                </div>

                {lendingCars.length > 0 ? (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {lendingCars.map((car) => (
                      <CarCard
                        key={car.id}
                        car={car}
                        onView={(id) => console.log("View car:", id)}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 glass rounded-xl">
                    <Car className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-300 mb-2">
                      No cars listed yet
                    </h3>
                    <p className="text-gray-500 mb-4">
                      Start earning by listing your first car
                    </p>
                    <Button>List Your Car</Button>
                  </div>
                )}
              </div>
            )}

            {activeTab === "borrowing" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-white">
                    Cars You're Renting
                  </h2>
                  <Button variant="secondary">Browse Marketplace</Button>
                </div>

                {borrowingCars.length > 0 ? (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {borrowingCars.map((car) => (
                      <CarCard
                        key={car.id}
                        car={car}
                        showOwner={true}
                        onView={(id) => console.log("View rental:", id)}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 glass rounded-xl">
                    <Calendar className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-300 mb-2">
                      No active rentals
                    </h3>
                    <p className="text-gray-500 mb-4">
                      Explore available cars to start your journey
                    </p>
                    <Button>Browse Cars</Button>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
