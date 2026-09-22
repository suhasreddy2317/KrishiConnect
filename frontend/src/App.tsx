import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import { AppLayout } from '@/components/layout/AppLayout';
import { ProtectedRoute } from '@/components/navigation/ProtectedRoute';
import { HomePage } from '@/pages/HomePage';
import { LoginPage } from '@/pages/LoginPage';
import { FarmerPage } from '@/pages/FarmerPage';
import { FpoPage } from '@/pages/FpoPage';
import { BuyerPage } from '@/pages/BuyerPage';
import { FieldAgentPage } from '@/pages/FieldAgentPage';
import { AdminPage } from '@/pages/AdminPage';
import { ProfilePage } from '@/pages/ProfilePage';
import { LanguageProvider } from '@/i18n/LanguageContext';
import { SplashScreen } from '@/components/SplashScreen';

const LandingLayout: React.FC = () => <Outlet />;

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <LanguageProvider>
        <SplashScreen />
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/" element={<LandingLayout />}>
              <Route index element={<HomePage />} />
            </Route>
            <Route path="/" element={<AppLayout />}>
              <Route path="farmer" element={
                <ProtectedRoute allowedRoles={['farmer']}>
                  <FarmerPage />
                </ProtectedRoute>
              } />
              <Route path="farmer/profile" element={
                <ProtectedRoute allowedRoles={['farmer']}>
                  <ProfilePage />
                </ProtectedRoute>
              } />
              <Route path="fpo" element={
                <ProtectedRoute allowedRoles={['fpo_manager']}>
                  <FpoPage />
                </ProtectedRoute>
              } />
              <Route path="fpo/profile" element={
                <ProtectedRoute allowedRoles={['fpo_manager']}>
                  <ProfilePage />
                </ProtectedRoute>
              } />
              <Route path="buyer/profile" element={
                <ProtectedRoute allowedRoles={['buyer']}>
                  <ProfilePage />
                </ProtectedRoute>
              } />
              <Route path="buyer/*" element={
                <ProtectedRoute allowedRoles={['buyer']}>
                  <BuyerPage />
                </ProtectedRoute>
              } />
              <Route path="field-agent" element={
                <ProtectedRoute allowedRoles={['field_agent']}>
                  <FieldAgentPage />
                </ProtectedRoute>
              } />
              <Route path="field-agent/profile" element={
                <ProtectedRoute allowedRoles={['field_agent']}>
                  <ProfilePage />
                </ProtectedRoute>
              } />
              <Route path="admin" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminPage />
                </ProtectedRoute>
              } />
              <Route path="admin/profile" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <ProfilePage />
                </ProtectedRoute>
              } />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </LanguageProvider>
    </AuthProvider>
  );
};

export default App;

