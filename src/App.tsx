/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MobileLayout from './components/layout/MobileLayout';
import Home from './pages/Home';
import Maintenance from './pages/Maintenance';
import Problems from './pages/Problems';
import Reminders from './pages/Reminders';
import SOS from './pages/SOS';
import Expenses from './pages/Expenses';
import Subscription from './pages/Subscription';
import Login from './pages/Login';
import Vehicles from './pages/Vehicles';
import { Toaster } from './components/ui/sonner';
import { AuthProvider, useAuth } from './contexts/AuthContext';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-white">Chargement...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<ProtectedRoute><MobileLayout /></ProtectedRoute>}>
            <Route index element={<Home />} />
            <Route path="vehicles" element={<Vehicles />} />
            <Route path="maintenance" element={<Maintenance />} />
            <Route path="problems" element={<Problems />} />
            <Route path="reminders" element={<Reminders />} />
            <Route path="sos" element={<SOS />} />
            <Route path="expenses" element={<Expenses />} />
            <Route path="subscription" element={<Subscription />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
        <Toaster position="top-center" />
      </BrowserRouter>
    </AuthProvider>
  );
}
