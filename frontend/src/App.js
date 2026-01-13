import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Toaster } from './components/ui/sonner';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Clients from './pages/Clients';
import Positions from './pages/Positions';
import Candidates from './pages/Candidates';
import CandidateSearch from './pages/CandidateSearch';
import ProfileReview from './pages/ProfileReview';
import ProfileSharing from './pages/ProfileSharing';
import Interviews from './pages/Interviews';
import Users from './pages/Users';
import Layout from './components/Layout';
import './App.css';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }
  
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  return <Layout>{children}</Layout>;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/clients" element={<ProtectedRoute><Clients /></ProtectedRoute>} />
          <Route path="/positions" element={<ProtectedRoute><Positions /></ProtectedRoute>} />
          <Route path="/candidates" element={<ProtectedRoute><Candidates /></ProtectedRoute>} />
          <Route path="/search" element={<ProtectedRoute><CandidateSearch /></ProtectedRoute>} />
          <Route path="/review" element={<ProtectedRoute><ProfileReview /></ProtectedRoute>} />
          <Route path="/share" element={<ProtectedRoute><ProfileSharing /></ProtectedRoute>} />
          <Route path="/interviews" element={<ProtectedRoute><Interviews /></ProtectedRoute>} />
          <Route path="/users" element={<ProtectedRoute><Users /></ProtectedRoute>} />
        </Routes>
      </BrowserRouter>
      <Toaster position="top-right" richColors />
    </AuthProvider>
  );
}

export default App;