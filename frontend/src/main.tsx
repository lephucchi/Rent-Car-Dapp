import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "./index.css";

import Landing from "./pages/Landing";
import Marketplace from "./pages/Marketplace";
import LendCar from "./pages/LentCar";
import ActiveRentals from "./pages/ActiveRental";
import Transactions from "./pages/Transaction";
import Auth from "./pages/Auth";
import Profile from "./pages/Profile";
import Inspector from "./pages/Inspector";
import Admin from "./pages/Admin";
import Dashboard from "./pages/Dashboard";

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/marketplace" element={<Marketplace />} />
          <Route path="/lend" element={<LendCar />} />
          <Route path="/active-rentals" element={<ActiveRentals />} />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/inspector" element={<Inspector />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>,
);
