import { motion } from "framer-motion";
import { Users, UserCheck, UserX, Shield, BarChart3 } from "lucide-react";

export default function AdminDashboard() {
  // Mock data for display purposes
  const stats = {
    total_users: 12,
    active_users: 8,
    inactive_users: 4,
    users_with_metamask: 6
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
        <p className="text-gray-600">Monitor system statistics</p>
      </div>

      {/* Stats Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-6"
      >
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <Users className="w-8 h-8 text-blue-500" />
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">{stats.total_users}</p>
              <p className="text-gray-600">Total Users</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <UserCheck className="w-8 h-8 text-green-500" />
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">{stats.active_users}</p>
              <p className="text-gray-600">Active Users</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <UserX className="w-8 h-8 text-red-500" />
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">{stats.inactive_users}</p>
              <p className="text-gray-600">Inactive Users</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <BarChart3 className="w-8 h-8 text-purple-500" />
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">{stats.users_with_metamask}</p>
              <p className="text-gray-600">With Wallet</p>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Admin Features</h2>
        <p className="text-gray-600">
          This is a simplified admin dashboard. To implement full admin functionality, 
          you would need to connect to your backend API and implement user management features.
        </p>
      </div>
    </div>
  );
}
