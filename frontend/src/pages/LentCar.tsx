import { useState } from "react";
import { motion } from "framer-motion";
import {
  Upload,
  Car,
  MapPin,
  DollarSign,
  Calendar,
  Camera,
  Plus,
  X,
} from "lucide-react";
import Navigation from "../components/Navigation";
import Button from "../components/Button";
import Input from "../components/Input";
import { useWeb3Store } from "../stores/web3Store";

export default function LendCar() {
  const [formData, setFormData] = useState({
    name: "",
    brand: "",
    model: "",
    year: "",
    seats: "",
    fuelType: "gasoline",
    location: "",
    pricePerDay: "",
    description: "",
    images: [] as string[],
  });

  const [uploading, setUploading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const { isConnected } = useWeb3Store();

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      setUploading(true);
      // Simulate image upload
      setTimeout(() => {
        const newImages = Array.from(files).map(
          (file, index) =>
            `https://images.pexels.com/photos/${Math.floor(Math.random() * 1000000)}/pexels-photo-${Math.floor(Math.random() * 1000000)}.jpeg`,
        );
        setFormData((prev) => ({
          ...prev,
          images: [...prev.images, ...newImages].slice(0, 5),
        }));
        setUploading(false);
      }, 1500);
    }
  };

  const removeImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isConnected) {
      alert("Please connect your wallet first");
      return;
    }

    setUploading(true);
    // Simulate smart contract deployment
    await new Promise((resolve) => setTimeout(resolve, 3000));
    setUploading(false);
    alert("Car successfully listed on the blockchain!");
  };

  const steps = [
    {
      id: 1,
      title: "Basic Info",
      description: "Car details and specifications",
    },
    { id: 2, title: "Photos", description: "Upload high-quality images" },
    {
      id: 3,
      title: "Pricing",
      description: "Set rental price and availability",
    },
  ];

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
              Please connect your wallet to list your car on the blockchain.
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
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              List Your{" "}
              <span className="bg-gradient-to-r from-neon-cyan to-neon-purple bg-clip-text text-transparent">
                Car
              </span>
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Earn cryptocurrency by sharing your vehicle with our global
              community
            </p>
          </motion.div>

          {/* Progress Steps */}
          <div className="flex items-center justify-center mb-8">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div
                  className={`flex items-center space-x-3 ${
                    currentStep >= step.id ? "text-neon-cyan" : "text-gray-500"
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                      currentStep >= step.id
                        ? "bg-gradient-to-r from-neon-purple to-neon-cyan text-white"
                        : "glass border border-gray-600"
                    }`}
                  >
                    {step.id}
                  </div>
                  <div className="hidden md:block">
                    <div className="font-medium">{step.title}</div>
                    <div className="text-sm text-gray-400">
                      {step.description}
                    </div>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`w-16 h-1 mx-4 rounded ${
                      currentStep > step.id
                        ? "bg-gradient-to-r from-neon-purple to-neon-cyan"
                        : "bg-gray-600"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass rounded-2xl p-8"
          >
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Step 1: Basic Info */}
              {currentStep === 1 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-6"
                >
                  <h3 className="text-2xl font-semibold text-white mb-6">
                    Basic Information
                  </h3>

                  <div className="grid md:grid-cols-2 gap-6">
                    <Input
                      label="Car Name"
                      placeholder="e.g., Tesla Model S"
                      value={formData.name}
                      onChange={(e) =>
                        handleInputChange("name", e.target.value)
                      }
                      required
                    />
                    <Input
                      label="Brand"
                      placeholder="e.g., Tesla"
                      value={formData.brand}
                      onChange={(e) =>
                        handleInputChange("brand", e.target.value)
                      }
                      required
                    />
                  </div>

                  <div className="grid md:grid-cols-3 gap-6">
                    <Input
                      label="Model"
                      placeholder="e.g., Model S"
                      value={formData.model}
                      onChange={(e) =>
                        handleInputChange("model", e.target.value)
                      }
                      required
                    />
                    <Input
                      label="Year"
                      type="number"
                      placeholder="2023"
                      value={formData.year}
                      onChange={(e) =>
                        handleInputChange("year", e.target.value)
                      }
                      required
                    />
                    <Input
                      label="Seats"
                      type="number"
                      placeholder="5"
                      value={formData.seats}
                      onChange={(e) =>
                        handleInputChange("seats", e.target.value)
                      }
                      required
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Fuel Type
                      </label>
                      <select
                        value={formData.fuelType}
                        onChange={(e) =>
                          handleInputChange("fuelType", e.target.value)
                        }
                        className="w-full glass border border-gray-600 rounded-lg px-4 py-3 text-white bg-transparent focus:outline-none focus:ring-2 focus:ring-neon-cyan"
                      >
                        <option value="gasoline" className="bg-gray-900">
                          Gasoline
                        </option>
                        <option value="electric" className="bg-gray-900">
                          Electric
                        </option>
                        <option value="hybrid" className="bg-gray-900">
                          Hybrid
                        </option>
                        <option value="diesel" className="bg-gray-900">
                          Diesel
                        </option>
                      </select>
                    </div>
                    <Input
                      label="Location"
                      placeholder="e.g., San Francisco, CA"
                      value={formData.location}
                      onChange={(e) =>
                        handleInputChange("location", e.target.value)
                      }
                      icon={<MapPin className="w-5 h-5" />}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) =>
                        handleInputChange("description", e.target.value)
                      }
                      placeholder="Describe your car's features, condition, and any special instructions..."
                      rows={4}
                      className="w-full glass border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-neon-cyan resize-none"
                    />
                  </div>
                </motion.div>
              )}

              {/* Step 2: Photos */}
              {currentStep === 2 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-6"
                >
                  <h3 className="text-2xl font-semibold text-white mb-6">
                    Upload Photos
                  </h3>

                  <div className="space-y-4">
                    <p className="text-gray-400">
                      Upload high-quality photos of your car. First photo will
                      be the main image.
                    </p>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {formData.images.map((image, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={image}
                            alt={`Car ${index + 1}`}
                            className="w-full h-32 object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-4 h-4" />
                          </button>
                          {index === 0 && (
                            <span className="absolute bottom-2 left-2 bg-neon-cyan text-black text-xs px-2 py-1 rounded">
                              Main
                            </span>
                          )}
                        </div>
                      ))}

                      {formData.images.length < 5 && (
                        <label className="w-full h-32 border-2 border-dashed border-gray-600 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-neon-cyan transition-colors">
                          <input
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="hidden"
                          />
                          {uploading ? (
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-neon-cyan"></div>
                          ) : (
                            <>
                              <Plus className="w-8 h-8 text-gray-400 mb-2" />
                              <span className="text-sm text-gray-400">
                                Add Photo
                              </span>
                            </>
                          )}
                        </label>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 3: Pricing */}
              {currentStep === 3 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-6"
                >
                  <h3 className="text-2xl font-semibold text-white mb-6">
                    Pricing & Availability
                  </h3>

                  <div className="grid md:grid-cols-2 gap-6">
                    <Input
                      label="Price per Day (ETH)"
                      type="number"
                      step="0.01"
                      placeholder="0.15"
                      value={formData.pricePerDay}
                      onChange={(e) =>
                        handleInputChange("pricePerDay", e.target.value)
                      }
                      icon={<DollarSign className="w-5 h-5" />}
                      required
                    />
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Availability
                      </label>
                      <select className="w-full glass border border-gray-600 rounded-lg px-4 py-3 text-white bg-transparent focus:outline-none focus:ring-2 focus:ring-neon-cyan">
                        <option value="immediate" className="bg-gray-900">
                          Available Immediately
                        </option>
                        <option value="custom" className="bg-gray-900">
                          Custom Schedule
                        </option>
                      </select>
                    </div>
                  </div>

                  <div className="glass p-6 rounded-xl">
                    <h4 className="text-lg font-semibold text-white mb-4">
                      Estimated Earnings
                    </h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Daily Rate:</span>
                        <span className="text-white">
                          {formData.pricePerDay || "0"} ETH
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Weekly (7 days):</span>
                        <span className="text-neon-cyan">
                          {(
                            (parseFloat(formData.pricePerDay) || 0) * 7
                          ).toFixed(2)}{" "}
                          ETH
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">
                          Monthly (30 days):
                        </span>
                        <span className="text-neon-purple">
                          {(
                            (parseFloat(formData.pricePerDay) || 0) * 30
                          ).toFixed(2)}{" "}
                          ETH
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between pt-8 border-t border-gray-700">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
                  disabled={currentStep === 1}
                >
                  Previous
                </Button>

                {currentStep < 3 ? (
                  <Button
                    type="button"
                    onClick={() => setCurrentStep(Math.min(3, currentStep + 1))}
                  >
                    Next
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    loading={uploading}
                    className="min-w-[120px]"
                  >
                    List Car
                  </Button>
                )}
              </div>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
