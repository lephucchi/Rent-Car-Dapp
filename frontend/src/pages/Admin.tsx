import React from 'react';
import { AdminPanel } from '../components/AdminPanel';

export default function Admin() {
  return (
    <div className="min-h-screen bg-background">
      <div className="luxury-container py-8">
        <AdminPanel />
      </div>
    </div>
  );
}
