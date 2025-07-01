import { Navigation } from "../components/Navigation";

export default function LendCar() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="pt-20 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-20">
            <h1 className="text-4xl font-bold mb-4">
              Lend Your{" "}
              <span className="bg-gradient-to-r from-neon-cyan to-neon-purple bg-clip-text text-transparent">
                Car
              </span>
            </h1>
            <p className="text-xl text-gray-300 mb-8">
              Connect your wallet to list your car on the blockchain
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
