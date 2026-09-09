import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
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
import { LanguageProvider } from '@/i18n/LanguageContext';
import { SplashScreen } from '@/components/SplashScreen';

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <LanguageProvider>
        <SplashScreen />
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/" element={<AppLayout />}>
              <Route index element={<HomePage />} />
              <Route
                path="farmer"
                element={
                  <ProtectedRoute allowedRoles={['farmer', 'admin', 'field_agent']}>
                    <FarmerPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="fpo"
                element={
                  <ProtectedRoute allowedRoles={['fpo_manager', 'admin', 'field_agent']}>
                    <FpoPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="buyer"
                element={
                  <ProtectedRoute allowedRoles={['buyer', 'admin', 'field_agent']}>
                    <BuyerPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="field-agent"
                element={
                  <ProtectedRoute allowedRoles={['field_agent', 'admin']}>
                    <FieldAgentPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="admin"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminPage />
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </LanguageProvider>
    </AuthProvider>
  );
};

export default App;

