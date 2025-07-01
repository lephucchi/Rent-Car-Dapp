import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, Filter, MapPin, SlidersHorizontal } from "lucide-react";
import Navigation from "../components/Navigation";
import CarCard from "../components/CarCard";
import Button from "../components/Button";
import Input from "../components/Input";
import { useWeb3Store } from "../stores/web3Store";

export default function Marketplace() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("all");
  const [priceRange, setPriceRange] = useState([0, 1]);
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(false);

  const { isConnected } = useWeb3Store();

  // Mock data for cars
  const [cars] = useState([
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
      name: "BMW M3 Competition",
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
      available: true,
    },
    {
      id: "3",
      name: "Audi A8 Quattro",
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
      available: true,
    },
    {
      id: "4",
      name: "Mercedes S-Class",
      image:
        "https://images.pexels.com/photos/3729464/pexels-photo-3729464.jpeg",
      location: "New York",
      pricePerDay: 0.22,
      rating: 4.9,
      reviews: 31,
      fuelType: "Gasoline",
      seats: 5,
      year: 2023,
      brand: "Mercedes",
      available: false,
    },
    {
      id: "5",
      name: "Porsche 911 Turbo",
      image:
        "https://images.pexels.com/photos/3849567/pexels-photo-3849567.jpeg",
      location: "Las Vegas",
      pricePerDay: 0.35,
      rating: 4.8,
      reviews: 12,
      fuelType: "Gasoline",
      seats: 2,
      year: 2023,
      brand: "Porsche",
      available: true,
    },
    {
      id: "6",
      name: "Lamborghini Huracán",
      image:
        "https://images.pexels.com/photos/2127733/pexels-photo-2127733.jpeg",
      location: "Miami",
      pricePerDay: 0.5,
      rating: 4.9,
      reviews: 8,
      fuelType: "Gasoline",
      seats: 2,
      year: 2022,
      brand: "Lamborghini",
      available: true,
    },
  ]);

  const locations = [
    "all",
    "San Francisco",
    "Los Angeles",
    "Miami",
    "New York",
    "Las Vegas",
  ];

  const filteredCars = cars.filter((car) => {
    const matchesSearch =
      car.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      car.brand.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLocation =
      selectedLocation === "all" || car.location === selectedLocation;
    const matchesPrice =
      car.pricePerDay >= priceRange[0] && car.pricePerDay <= priceRange[1];

    return matchesSearch && matchesLocation && matchesPrice;
  });

  const handleRentCar = async (carId: string) => {
    if (!isConnected) {
      alert("Please connect your wallet first");
      return;
    }

    setLoading(true);
    // Simulate blockchain transaction
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setLoading(false);
    alert(`Rental request initiated for car ${carId}`);
  };

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
              Car{" "}
              <span className="bg-gradient-to-r from-neon-cyan to-neon-purple bg-clip-text text-transparent">
                Marketplace
              </span>
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Discover premium vehicles available for rent on the blockchain
            </p>
          </motion.div>

          {/* Search and Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass rounded-xl p-6 mb-8"
          >
            <div className="flex flex-col lg:flex-row gap-4 items-center">
              <div className="flex-1 w-full">
                <Input
                  placeholder="Search cars, brands, or models..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  icon={<Search className="w-5 h-5" />}
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
                <select
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className="glass border border-gray-600 rounded-lg px-4 py-3 text-white bg-transparent focus:outline-none focus:ring-2 focus:ring-neon-cyan"
                >
                  {locations.map((location) => (
                    <option
                      key={location}
                      value={location}
                      className="bg-gray-900"
                    >
                      {location === "all" ? "All Locations" : location}
                    </option>
                  ))}
                </select>

                <Button
                  variant="outline"
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center space-x-2"
                >
                  <SlidersHorizontal className="w-5 h-5" />
                  <span>Filters</span>
                </Button>
              </div>
            </div>

            {/* Advanced Filters */}
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-6 pt-6 border-t border-gray-700"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Price Range (ETH/day)
                    </label>
                    <div className="space-y-2">
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.05"
                        value={priceRange[1]}
                        onChange={(e) =>
                          setPriceRange([0, parseFloat(e.target.value)])
                        }
                        className="w-full accent-neon-cyan"
                      />
                      <div className="flex justify-between text-sm text-gray-400">
                        <span>0 ETH</span>
                        <span>{priceRange[1]} ETH</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Fuel Type
                    </label>
                    <select className="glass border border-gray-600 rounded-lg px-4 py-3 text-white bg-transparent focus:outline-none focus:ring-2 focus:ring-neon-cyan w-full">
                      <option value="all" className="bg-gray-900">
                        All Types
                      </option>
                      <option value="electric" className="bg-gray-900">
                        Electric
                      </option>
                      <option value="gasoline" className="bg-gray-900">
                        Gasoline
                      </option>
                      <option value="hybrid" className="bg-gray-900">
                        Hybrid
                      </option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Seats
                    </label>
                    <select className="glass border border-gray-600 rounded-lg px-4 py-3 text-white bg-transparent focus:outline-none focus:ring-2 focus:ring-neon-cyan w-full">
                      <option value="all" className="bg-gray-900">
                        Any
                      </option>
                      <option value="2" className="bg-gray-900">
                        2 seats
                      </option>
                      <option value="4" className="bg-gray-900">
                        4 seats
                      </option>
                      <option value="5" className="bg-gray-900">
                        5+ seats
                      </option>
                    </select>
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>

          {/* Results Summary */}
          <div className="flex items-center justify-between mb-6">
            <p className="text-gray-400">
              Showing {filteredCars.length} of {cars.length} cars
            </p>
            <select className="glass border border-gray-600 rounded-lg px-4 py-2 text-white bg-transparent focus:outline-none focus:ring-2 focus:ring-neon-cyan">
              <option value="featured" className="bg-gray-900">
                Featured
              </option>
              <option value="price-low" className="bg-gray-900">
                Price: Low to High
              </option>
              <option value="price-high" className="bg-gray-900">
                Price: High to Low
              </option>
              <option value="rating" className="bg-gray-900">
                Highest Rated
              </option>
            </select>
          </div>

          {/* Car Grid */}
          {filteredCars.length > 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {filteredCars.map((car, index) => (
                <motion.div
                  key={car.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <CarCard
                    car={car}
                    onRent={handleRentCar}
                    onView={(id) => console.log("View car details:", id)}
                  />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <div className="text-center py-20">
              <Search className="w-16 h-16 text-gray-500 mx-auto mb-4" />
              <h3 className="text-2xl font-semibold text-gray-300 mb-2">
                No cars found
              </h3>
              <p className="text-gray-500">
                Try adjusting your search criteria
              </p>
            </div>
          )}

          {/* Load More */}
          {filteredCars.length > 0 && (
            <div className="text-center mt-12">
              <Button variant="outline" size="lg">
                Load More Cars
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
