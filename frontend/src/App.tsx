import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { HomePage } from '@/pages/HomePage';
import { FarmerPage } from '@/pages/FarmerPage';
import { FpoPage } from '@/pages/FpoPage';
import { BuyerPage } from '@/pages/BuyerPage';
import { FieldAgentPage } from '@/pages/FieldAgentPage';
import { AdminPage } from '@/pages/AdminPage';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AppLayout />}>
          <Route index element={<HomePage />} />
          <Route path="farmer" element={<FarmerPage />} />
          <Route path="fpo" element={<FpoPage />} />
          <Route path="buyer" element={<BuyerPage />} />
          <Route path="field-agent" element={<FieldAgentPage />} />
          <Route path="admin" element={<AdminPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;

