import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navigation from "../components/Navigation";
import RentalManagement from "../components/RentalManagement";
import { ContractDisplay } from "../components/ContractDisplay";
import { useAuthStore } from "../stores/authStore";
import { useContractStore } from "../stores/contractStore";

export default function Dashboard() {
  const { user, isAuthenticated } = useAuthStore();
  const { contractStatus } = useContractStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth');
    }
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="pt-20 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Rental Management */}
            <div>
              <RentalManagement />
            </div>
            
            {/* Right Column - Contract Details */}
            <div>
              <ContractDisplay contractAddress={contractStatus?.contract_address} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}