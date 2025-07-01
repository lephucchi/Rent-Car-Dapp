import { useState } from "react";
import { motion } from "framer-motion";
import {
  Calendar,
  Filter,
  ExternalLink,
  Search,
  Download,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import Navigation from "../components/Navigation";
import Button from "../components/Button";
import Input from "../components/Input";
import { useWeb3Store } from "../stores/web3Store";

interface Transaction {
  id: string;
  hash: string;
  type: "rent" | "return" | "listing" | "payment" | "refund";
  amount: number;
  timestamp: string;
  status: "confirmed" | "pending" | "failed";
  carName?: string;
  fromAddress: string;
  toAddress: string;
  gasUsed: number;
  gasPrice: number;
  blockNumber: number;
}

export default function Transactions() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [dateRange, setDateRange] = useState("all");

  const { isConnected, address } = useWeb3Store();

  // Mock transaction data
  const [transactions] = useState<Transaction[]>([
    {
      id: "1",
      hash: "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef12",
      type: "rent",
      amount: 1.0,
      timestamp: "2024-01-20T10:30:00Z",
      status: "confirmed",
      carName: "Tesla Model S",
      fromAddress: "0xabcdef1234567890abcdef1234567890abcdef12",
      toAddress: "0x1234567890abcdef1234567890abcdef12345678",
      gasUsed: 21000,
      gasPrice: 20,
      blockNumber: 18500000,
    },
    {
      id: "2",
      hash: "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890ab",
      type: "listing",
      amount: 0.05,
      timestamp: "2024-01-18T15:45:00Z",
      status: "confirmed",
      carName: "BMW M3 Competition",
      fromAddress: "0x1234567890abcdef1234567890abcdef12345678",
      toAddress: "0x0000000000000000000000000000000000000000",
      gasUsed: 45000,
      gasPrice: 25,
      blockNumber: 18499500,
    },
    {
      id: "3",
      hash: "0x9876543210fedcba9876543210fedcba9876543210fedcba9876543210fedcba98",
      type: "payment",
      amount: 0.6,
      timestamp: "2024-01-16T08:20:00Z",
      status: "confirmed",
      carName: "Audi A8 Quattro",
      fromAddress: "0xfedcba9876543210fedcba9876543210fedcba98",
      toAddress: "0x9876543210fedcba9876543210fedcba98765432",
      gasUsed: 21000,
      gasPrice: 18,
      blockNumber: 18499000,
    },
    {
      id: "4",
      hash: "0x5555666677778888999900001111222233334444555566667777888899990000",
      type: "return",
      amount: 0.1,
      timestamp: "2024-01-15T12:00:00Z",
      status: "pending",
      carName: "Mercedes S-Class",
      fromAddress: "0x1111222233334444555566667777888899990000",
      toAddress: "0x0000111122223333444455556666777788889999",
      gasUsed: 35000,
      gasPrice: 22,
      blockNumber: 18498500,
    },
  ]);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "rent":
        return "🚗";
      case "return":
        return "🔄";
      case "listing":
        return "📝";
      case "payment":
        return "💰";
      case "refund":
        return "💸";
      default:
        return "📄";
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "rent":
        return "text-blue-400";
      case "return":
        return "text-green-400";
      case "listing":
        return "text-purple-400";
      case "payment":
        return "text-neon-cyan";
      case "refund":
        return "text-yellow-400";
      default:
        return "text-gray-400";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "text-green-400 bg-green-400/10 border-green-400/30";
      case "pending":
        return "text-yellow-400 bg-yellow-400/10 border-yellow-400/30";
      case "failed":
        return "text-red-400 bg-red-400/10 border-red-400/30";
      default:
        return "text-gray-400 bg-gray-400/10 border-gray-400/30";
    }
  };

  const filteredTransactions = transactions.filter((tx) => {
    const matchesSearch =
      tx.hash.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.carName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "all" || tx.type === filterType;
    const matchesStatus = filterStatus === "all" || tx.status === filterStatus;

    return matchesSearch && matchesType && matchesStatus;
  });

  const totalValue = transactions.reduce((sum, tx) => sum + tx.amount, 0);
  const confirmedTransactions = transactions.filter(
    (tx) => tx.status === "confirmed",
  ).length;

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="pt-20 pb-16 min-h-screen flex items-center justify-center">
          <div className="text-center space-y-6">
            <Calendar className="w-16 h-16 text-neon-cyan mx-auto" />
            <h2 className="text-2xl font-bold text-white">
              Connect Your Wallet
            </h2>
            <p className="text-gray-400 max-w-md">
              Please connect your wallet to view your transaction history.
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
              Transaction{" "}
              <span className="bg-gradient-to-r from-neon-cyan to-neon-purple bg-clip-text text-transparent">
                History
              </span>
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Track all your blockchain transactions and smart contract
              interactions
            </p>
          </motion.div>

          {/* Stats Overview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
          >
            <div className="glass rounded-xl p-6 text-center">
              <div className="text-2xl font-bold text-white">
                {transactions.length}
              </div>
              <div className="text-gray-400">Total Transactions</div>
            </div>
            <div className="glass rounded-xl p-6 text-center">
              <div className="text-2xl font-bold text-green-400">
                {confirmedTransactions}
              </div>
              <div className="text-gray-400">Confirmed</div>
            </div>
            <div className="glass rounded-xl p-6 text-center">
              <div className="text-2xl font-bold text-neon-cyan">
                {totalValue.toFixed(2)}
              </div>
              <div className="text-gray-400">Total ETH</div>
            </div>
            <div className="glass rounded-xl p-6 text-center">
              <div className="text-2xl font-bold text-neon-purple">
                {(
                  transactions.reduce(
                    (sum, tx) => sum + (tx.gasUsed * tx.gasPrice) / 1e9,
                    0,
                  ) / 1e9
                ).toFixed(4)}
              </div>
              <div className="text-gray-400">Gas Used (ETH)</div>
            </div>
          </motion.div>

          {/* Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass rounded-xl p-6 mb-8"
          >
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Search by transaction hash or car name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  icon={<Search className="w-5 h-5" />}
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="glass border border-gray-600 rounded-lg px-4 py-3 text-white bg-transparent focus:outline-none focus:ring-2 focus:ring-neon-cyan"
                >
                  <option value="all" className="bg-gray-900">
                    All Types
                  </option>
                  <option value="rent" className="bg-gray-900">
                    Rent
                  </option>
                  <option value="return" className="bg-gray-900">
                    Return
                  </option>
                  <option value="listing" className="bg-gray-900">
                    Listing
                  </option>
                  <option value="payment" className="bg-gray-900">
                    Payment
                  </option>
                  <option value="refund" className="bg-gray-900">
                    Refund
                  </option>
                </select>

                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="glass border border-gray-600 rounded-lg px-4 py-3 text-white bg-transparent focus:outline-none focus:ring-2 focus:ring-neon-cyan"
                >
                  <option value="all" className="bg-gray-900">
                    All Status
                  </option>
                  <option value="confirmed" className="bg-gray-900">
                    Confirmed
                  </option>
                  <option value="pending" className="bg-gray-900">
                    Pending
                  </option>
                  <option value="failed" className="bg-gray-900">
                    Failed
                  </option>
                </select>

                <Button variant="outline">
                  <Download className="w-4 h-4" />
                  Export
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Transactions List */}
          {filteredTransactions.length > 0 ? (
            <div className="space-y-4">
              {filteredTransactions.map((tx, index) => (
                <motion.div
                  key={tx.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + index * 0.05 }}
                  className="glass rounded-xl p-6 hover:bg-white/5 transition-colors"
                >
                  <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                    <div className="flex items-start space-x-4 flex-1">
                      <div className="text-2xl">{getTypeIcon(tx.type)}</div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3
                            className={`font-semibold capitalize ${getTypeColor(tx.type)}`}
                          >
                            {tx.type} {tx.carName && `- ${tx.carName}`}
                          </h3>
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium border ${getStatusColor(tx.status)}`}
                          >
                            {tx.status}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-400">
                          <div>
                            Hash: {tx.hash.slice(0, 10)}...{tx.hash.slice(-8)}
                          </div>
                          <div>Block: {tx.blockNumber.toLocaleString()}</div>
                          <div>
                            From: {tx.fromAddress.slice(0, 6)}...
                            {tx.fromAddress.slice(-4)}
                          </div>
                          <div>
                            To: {tx.toAddress.slice(0, 6)}...
                            {tx.toAddress.slice(-4)}
                          </div>
                        </div>

                        <div className="text-xs text-gray-500 mt-1">
                          Gas: {tx.gasUsed.toLocaleString()} units @{" "}
                          {tx.gasPrice} gwei
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <div className="text-lg font-bold text-white">
                          {tx.amount.toFixed(4)} ETH
                        </div>
                        <div className="text-sm text-gray-400">
                          {new Date(tx.timestamp).toLocaleDateString()}
                        </div>
                      </div>

                      <a
                        href={`https://etherscan.io/tx/${tx.hash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-neon-cyan hover:text-neon-purple transition-colors"
                      >
                        <ExternalLink className="w-5 h-5" />
                      </a>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 glass rounded-xl">
              <Calendar className="w-16 h-16 text-gray-500 mx-auto mb-4" />
              <h3 className="text-2xl font-semibold text-gray-300 mb-2">
                No transactions found
              </h3>
              <p className="text-gray-500">
                Try adjusting your search criteria
              </p>
            </div>
          )}

          {/* Load More */}
          {filteredTransactions.length > 0 && (
            <div className="text-center mt-8">
              <Button variant="outline">Load More Transactions</Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
