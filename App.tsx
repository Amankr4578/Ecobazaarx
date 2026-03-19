
import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import VerifyEmail from './pages/VerifyEmail';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import AdminPanel from './pages/AdminPanel';
import Analytics from './pages/Analytics';
import Unauthorized from './pages/Unauthorized';
import ProtectedRoute from './components/ProtectedRoute';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Rewards from './pages/Rewards';
import Profile from './pages/Profile';
import History from './pages/History';
import OrderHistory from './pages/OrderHistory';
import OrderTracking from './pages/OrderTracking';
import Offers from './pages/Offers';
import CircularMarketplace from './pages/CircularMarketplace';
import SustainabilityScanner from './pages/SustainabilityScanner';
import { UserRole } from './types';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <HashRouter>
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <main className="flex-grow">
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/verify-email" element={<VerifyEmail />} />
              <Route path="/unauthorized" element={<Unauthorized />} />
              <Route path="/products" element={<Products />} />
              <Route path="/products/:id" element={<ProductDetail />} />
              <Route path="/offers" element={<Offers />} />
              <Route path="/circular" element={<CircularMarketplace />} />
              <Route path="/scanner" element={<SustainabilityScanner />} />
              <Route path="/rewards" element={<Rewards />} />
              <Route 
                path="/profile" 
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/history" 
                element={
                  <ProtectedRoute>
                    <History />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/orders" 
                element={
                  <ProtectedRoute>
                    <OrderHistory />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/track/:id" 
                element={
                  <ProtectedRoute>
                    <OrderTracking />
                  </ProtectedRoute>
                } 
              />

              {/* Protected Routes */}
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/admin-dashboard" 
                element={
                  <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
                    <AdminDashboard />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/admin" 
                element={
                  <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
                    <AdminPanel />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/analytics" 
                element={
                  <ProtectedRoute allowedRoles={[UserRole.ADMIN, UserRole.ANALYST]}>
                    <Analytics />
                  </ProtectedRoute>
                } 
              />

              {/* Default Redirect */}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="*" element={<div className="p-8 text-center">404 - Not Found</div>} />
            </Routes>
          </main>
          <footer className="bg-white border-t py-6 text-center text-sm text-gray-500">
            &copy; {new Date().getFullYear()} EcoBazaar Marketplace. Sustainable & Transparent.
          </footer>
        </div>
      </HashRouter>
    </AuthProvider>
  );
};

export default App;
