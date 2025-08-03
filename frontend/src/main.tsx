import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "./contexts/ThemeContext";
import { PreviewModeProvider } from "./contexts/PreviewModeContext";
import { Web3Provider } from "./contexts/Web3Context";
import { LuxuryNavigation } from "./components/LuxuryNavigation";
import { GlobalErrorDisplay } from "./components/GlobalErrorDisplay";
import { AuroraPreviewPanel } from "./components/AuroraPreviewPanel";
import "./global.css";

import Home from "./pages/Home";
import RentCar from "./pages/RentCar";
import LendCar from "./pages/LendCar";
import Transactions from "./pages/Transaction";
import Inspector from "./pages/Inspector";
import Admin from "./pages/Admin";
import RentalContract from "./pages/RentalContract";

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <PreviewModeProvider>
          <Web3Provider>
            <BrowserRouter>
              <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
                <LuxuryNavigation />
                <GlobalErrorDisplay />
                <AuroraPreviewPanel />
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/rent" element={<RentCar />} />
                  <Route path="/lend" element={<LendCar />} />
                  <Route path="/transactions" element={<Transactions />} />
                  <Route path="/inspector" element={<Inspector />} />
                  <Route path="/admin" element={<Admin />} />
                  <Route path="/contract" element={<RentalContract />} />
                </Routes>
              </div>
            </BrowserRouter>
          </Web3Provider>
        </PreviewModeProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </React.StrictMode>,
);
