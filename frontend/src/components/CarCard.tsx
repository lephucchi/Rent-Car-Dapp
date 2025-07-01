import { motion } from "framer-motion";
import { MapPin, Calendar, DollarSign, Star, Fuel, Users } from "lucide-react";
import Button from "./Button";

interface CarCardProps {
  car: {
    id: string;
    name: string;
    image: string;
    location: string;
    pricePerDay: number;
    rating: number;
    reviews: number;
    fuelType: string;
    seats: number;
    year: number;
    brand: string;
    available: boolean;
    owner?: string;
  };
  onRent?: (carId: string) => void;
  onView?: (carId: string) => void;
  showOwner?: boolean;
}

export default function CarCard({
  car,
  onRent,
  onView,
  showOwner = false,
}: CarCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      className="glass-hover rounded-xl overflow-hidden group"
    >
      {/* Car Image */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={car.image}
          alt={car.name}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
        />
        <div className="absolute top-4 left-4">
          <span
            className={`px-3 py-1 rounded-full text-xs font-medium ${
              car.available
                ? "bg-green-500/20 text-green-400 border border-green-500/30"
                : "bg-red-500/20 text-red-400 border border-red-500/30"
            }`}
          >
            {car.available ? "Available" : "Rented"}
          </span>
        </div>
        <div className="absolute top-4 right-4 flex items-center space-x-1 bg-black/50 backdrop-blur-sm px-2 py-1 rounded-lg">
          <Star className="w-3 h-3 text-yellow-400 fill-current" />
          <span className="text-xs text-white">{car.rating}</span>
          <span className="text-xs text-gray-300">({car.reviews})</span>
        </div>
      </div>

      {/* Car Details */}
      <div className="p-6 space-y-4">
        <div>
          <h3 className="text-xl font-semibold text-white mb-1">{car.name}</h3>
          <p className="text-gray-400 text-sm">
            {car.brand} • {car.year}
          </p>
        </div>

        <div className="flex items-center space-x-4 text-sm text-gray-400">
          <div className="flex items-center space-x-1">
            <MapPin className="w-4 h-4" />
            <span>{car.location}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Users className="w-4 h-4" />
            <span>{car.seats} seats</span>
          </div>
          <div className="flex items-center space-x-1">
            <Fuel className="w-4 h-4" />
            <span>{car.fuelType}</span>
          </div>
        </div>

        {showOwner && car.owner && (
          <div className="flex items-center space-x-2 text-sm">
            <span className="text-gray-400">Owner:</span>
            <span className="text-neon-cyan font-mono">{car.owner}</span>
          </div>
        )}

        <div className="flex items-center justify-between pt-4 border-t border-gray-700">
          <div className="flex items-center space-x-1">
            <DollarSign className="w-5 h-5 text-neon-cyan" />
            <span className="text-2xl font-bold text-white">
              {car.pricePerDay}
            </span>
            <span className="text-gray-400">ETH/day</span>
          </div>

          <div className="flex space-x-2">
            {onView && (
              <Button variant="ghost" size="sm" onClick={() => onView(car.id)}>
                View
              </Button>
            )}
            {onRent && car.available && (
              <Button size="sm" onClick={() => onRent(car.id)}>
                Rent Now
              </Button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
