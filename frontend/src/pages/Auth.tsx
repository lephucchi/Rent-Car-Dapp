import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Mail, Lock, User, Wallet, ArrowLeft } from "lucide-react";
import Navigation from "../components/Navigation";
import Button from "../components/Button";
import Input from "../components/Input";
import { useWeb3Store } from "../stores/web3Store";

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const { connectWallet, isConnected, address } = useWeb3Store();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    setLoading(false);
    // Handle authentication logic here
  };

  const handleWalletAuth = async () => {
    setLoading(true);
    try {
      await connectWallet();
    } catch (error) {
      console.error("Wallet connection failed:", error);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="pt-20 pb-16 min-h-screen flex items-center justify-center">
        <div className="max-w-md w-full mx-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass rounded-2xl p-8 space-y-6"
          >
            {/* Header */}
            <div className="text-center space-y-2">
              <Link
                to="/"
                className="inline-flex items-center text-neon-cyan hover:text-neon-purple transition-colors mb-4"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Link>
              <h2 className="text-3xl font-bold text-white">
                {isLogin ? "Welcome Back" : "Create Account"}
              </h2>
              <p className="text-gray-400">
                {isLogin
                  ? "Sign in to your account to continue"
                  : "Join the future of car rental"}
              </p>
            </div>

            {/* Wallet Connect */}
            <div className="space-y-4">
              <Button
                onClick={handleWalletAuth}
                loading={loading}
                className="w-full"
                disabled={isConnected}
              >
                <Wallet className="w-5 h-5" />
                {isConnected
                  ? `Connected: ${address?.slice(0, 6)}...${address?.slice(-4)}`
                  : "Connect with Wallet"}
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-600"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-background text-gray-400">
                    Or continue with email
                  </span>
                </div>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <Input
                  label="Full Name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your full name"
                  icon={<User className="w-5 h-5" />}
                  required
                />
              )}

              <Input
                label="Email Address"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                icon={<Mail className="w-5 h-5" />}
                required
              />

              <Input
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                icon={<Lock className="w-5 h-5" />}
                required
              />

              <Button type="submit" loading={loading} className="w-full">
                {isLogin ? "Sign In" : "Create Account"}
              </Button>
            </form>

            {/* Footer */}
            <div className="text-center space-y-4">
              {isLogin && (
                <Link
                  to="#"
                  className="text-neon-cyan hover:text-neon-purple transition-colors text-sm"
                >
                  Forgot your password?
                </Link>
              )}

              <p className="text-gray-400 text-sm">
                {isLogin
                  ? "Don't have an account?"
                  : "Already have an account?"}{" "}
                <button
                  type="button"
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-neon-cyan hover:text-neon-purple transition-colors font-medium"
                >
                  {isLogin ? "Sign up" : "Sign in"}
                </button>
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
