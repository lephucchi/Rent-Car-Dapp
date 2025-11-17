import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "./contexts/ThemeContext";
import { Web3Provider } from "./contexts/Web3Context";
import { LuxuryNavigation } from "./components/LuxuryNavigation";
import { GlobalErrorDisplay } from "./components/GlobalErrorDisplay";
import { AuthInitializer } from "./components/AuthInitializer";
import "./global.css";

import Home from "./pages/Home";
import RentCar from "./pages/RentCar";
import LendCar from "./pages/LendCar";
import Transactions from "./pages/Transaction";
import Inspector from "./pages/Inspector";
import Admin from "./pages/Admin";
import RentalContract from "./pages/RentalContract";
import Auth from "./pages/Auth";
import MyRentals from "./pages/MyRentals";
import MyContracts from "./pages/MyContracts";

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthInitializer>
        <ThemeProvider>
          <Web3Provider>
            <BrowserRouter>
              <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
                <LuxuryNavigation />
                <GlobalErrorDisplay />
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/rent" element={<RentCar />} />
                  <Route path="/lend" element={<LendCar />} />
                  <Route path="/my-rentals" element={<MyRentals />} />
                  <Route path="/my-contracts" element={<MyContracts />} />
                  <Route path="/transactions" element={<Transactions />} />
                  <Route path="/inspector" element={<Inspector />} />
                  <Route path="/admin" element={<Admin />} />
                  <Route path="/contract" element={<RentalContract />} />
                </Routes>
              </div>
            </BrowserRouter>
          </Web3Provider>
        </ThemeProvider>
      </AuthInitializer>
    </QueryClientProvider>
  </React.StrictMode>,
);
