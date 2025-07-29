import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "./contexts/ThemeContext";
import { LuxuryNavigation } from "./components/LuxuryNavigation";
import "./global.css";

import Home from "./pages/Home";
import Rent from "./pages/Rent";
import Transactions from "./pages/Transactions";
import Admin from "./pages/Admin";

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <BrowserRouter>
          <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
            <LuxuryNavigation />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/rent" element={<Rent />} />
              <Route path="/transactions" element={<Transactions />} />
              <Route path="/admin" element={<Admin />} />
            </Routes>
          </div>
        </BrowserRouter>
      </ThemeProvider>
    </QueryClientProvider>
  </React.StrictMode>,
);
