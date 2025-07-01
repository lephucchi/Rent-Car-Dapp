import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Zap, Shield, Globe } from "lucide-react";
import Navigation from "../components/Navigation";
import { useWeb3Store } from "../stores/web3Store";

export default function Landing() {
  const { isConnected, connectWallet } = useWeb3Store();

  const features = [
    {
      icon: Shield,
      title: "Blockchain Security",
      description: "Smart contracts ensure secure and transparent transactions",
    },
    {
      icon: Zap,
      title: "Instant Booking",
      description: "Book any car instantly with cryptocurrency payments",
    },
    {
      icon: Globe,
      title: "Global Network",
      description: "Access cars worldwide through our decentralized platform",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Hero Section */}
      <section className="relative pt-20 pb-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-neon-purple/10 via-transparent to-neon-cyan/10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-8"
            >
              <div className="space-y-4">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="inline-flex items-center space-x-2 glass px-4 py-2 rounded-full text-sm"
                >
                  <Zap className="w-4 h-4 text-neon-cyan" />
                  <span>Powered by Ethereum</span>
                </motion.div>

                <h1 className="text-4xl md:text-6xl font-bold leading-tight">
                  Rent Cars with{" "}
                  <span className="bg-gradient-to-r from-neon-cyan to-neon-purple bg-clip-text text-transparent">
                    Crypto
                  </span>
                </h1>

                <p className="text-xl text-gray-300 max-w-xl">
                  Experience the future of car rental with our decentralized
                  platform. Secure, transparent, and instant blockchain
                  transactions.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                {!isConnected ? (
                  <button
                    onClick={connectWallet}
                    className="flex items-center justify-center space-x-2 bg-gradient-to-r from-neon-purple to-neon-cyan px-8 py-4 rounded-lg font-medium text-white hover:shadow-lg hover:shadow-neon-purple/25 transition-all duration-200 group"
                  >
                    Connect Wallet & Start
                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                ) : (
                  <Link
                    to="/marketplace"
                    className="flex items-center justify-center space-x-2 bg-gradient-to-r from-neon-purple to-neon-cyan px-8 py-4 rounded-lg font-medium text-white hover:shadow-lg hover:shadow-neon-purple/25 transition-all duration-200 group"
                  >
                    Browse Cars
                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                )}

                <button className="glass-hover px-8 py-4 rounded-lg font-medium text-white">
                  Learn More
                </button>
              </div>
            </motion.div>

            {/* Right Content - Hero Image */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="h-96 md:h-[500px] relative">
                <img
                  src="https://images.pexels.com/photos/28772164/pexels-photo-28772164.jpeg"
                  alt="Tesla Model S"
                  className="w-full h-full object-cover rounded-xl neon-glow-purple"
                />

                {/* Floating Elements */}
                <motion.div
                  animate={{ y: [-10, 10, -10] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="absolute top-10 right-10 glass p-3 rounded-lg"
                >
                  <Shield className="w-6 h-6 text-neon-cyan" />
                </motion.div>

                <motion.div
                  animate={{ y: [10, -10, 10] }}
                  transition={{ duration: 4, repeat: Infinity }}
                  className="absolute bottom-20 left-10 glass p-3 rounded-lg"
                >
                  <Zap className="w-6 h-6 text-neon-purple" />
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Why Choose{" "}
              <span className="bg-gradient-to-r from-neon-cyan to-neon-purple bg-clip-text text-transparent">
                RentDApp
              </span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Revolutionary car rental experience powered by blockchain
              technology
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.2 }}
                  viewport={{ once: true }}
                  className="glass-hover p-8 rounded-xl text-center group"
                >
                  <div className="w-16 h-16 bg-gradient-to-r from-neon-purple to-neon-cyan rounded-lg flex items-center justify-center mx-auto mb-6 group-hover:shadow-lg group-hover:shadow-neon-purple/25 transition-all duration-300">
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-4">
                    {feature.title}
                  </h3>
                  <p className="text-gray-400">{feature.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-neon-purple/20 to-neon-cyan/20" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <h2 className="text-3xl md:text-4xl font-bold">
              Ready to Experience the Future?
            </h2>
            <p className="text-xl text-gray-300">
              Join thousands of users already renting cars with cryptocurrency
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/marketplace"
                className="bg-gradient-to-r from-neon-purple to-neon-cyan px-8 py-4 rounded-lg font-medium text-white hover:shadow-lg hover:shadow-neon-purple/25 transition-all duration-200"
              >
                Start Renting Now
              </Link>
              <Link
                to="/lend"
                className="glass-hover px-8 py-4 rounded-lg font-medium text-white"
              >
                List Your Car
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
