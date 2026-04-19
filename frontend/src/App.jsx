import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import HarvesterDashboard from './pages/HarvesterDashboard';
import DepotDashboard from './pages/DepotDashboard';
import TraderDashboard from './pages/TraderDashboard';
import AdminDashboard from './pages/AdminDashboard';
import ProvenancePage from './pages/ProvenancePage';
import BuyerScanPage from './pages/BuyerScanPage';
import ProtectedRoute from './components/ProtectedRoute';

function RootRedirect() {
  const { user, isLoading } = useAuth();
  if (isLoading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  
  switch (user.role) {
    case 'harvester': return <Navigate to="/harvester" replace />;
    case 'depot_manager': return <Navigate to="/depot" replace />;
    case 'trader': return <Navigate to="/trader" replace />;
    case 'admin': return <Navigate to="/admin" replace />;
    default: return <Navigate to="/login" replace />;
  }
}

function AppContent() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<RootRedirect />} />
      
      <Route path="/harvester" element={
        <ProtectedRoute allowedRoles={['harvester']}><HarvesterDashboard /></ProtectedRoute>
      } />
      <Route path="/depot" element={
        <ProtectedRoute allowedRoles={['depot_manager']}><DepotDashboard /></ProtectedRoute>
      } />
      <Route path="/trader" element={
        <ProtectedRoute allowedRoles={['trader']}><TraderDashboard /></ProtectedRoute>
      } />
      <Route path="/admin" element={
        <ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>
      } />
      
      <Route path="/provenance/:batchId" element={<ProvenancePage />} />
      <Route path="/scan" element={<BuyerScanPage />} />
      
      {/* Catch-all: redirect any unknown path to login */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </AuthProvider>
  );
}
