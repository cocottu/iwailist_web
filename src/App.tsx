import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { OfflineIndicator, PWAInstallPrompt, UpdatePrompt } from '@/components/ui';
import { initializeDB } from '@/database';
import { Dashboard } from '@/pages/Dashboard';
import { GiftList } from '@/pages/GiftList';
import { GiftDetail } from '@/pages/GiftDetail';
import { GiftForm } from '@/pages/GiftForm';
import { PersonList } from '@/pages/PersonList';
import { PersonDetail } from '@/pages/PersonDetail';
import { PersonForm } from '@/pages/PersonForm';
import { Statistics } from '@/pages/Statistics';

function App() {
  useEffect(() => {
    // データベース初期化
    initializeDB().catch((error) => {
      console.error('Failed to initialize database:', error);
    });
  }, []);

  return (
    <Router>
      {/* PWA関連のUI */}
      <OfflineIndicator />
      <PWAInstallPrompt />
      <UpdatePrompt />
      
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/gifts" element={<GiftList />} />
          <Route path="/gifts/new" element={<GiftForm />} />
          <Route path="/gifts/:id" element={<GiftDetail />} />
          <Route path="/gifts/:id/edit" element={<GiftForm />} />
          <Route path="/persons" element={<PersonList />} />
          <Route path="/persons/new" element={<PersonForm />} />
          <Route path="/persons/:id" element={<PersonDetail />} />
          <Route path="/persons/:id/edit" element={<PersonForm />} />
          <Route path="/statistics" element={<Statistics />} />
          <Route path="*" element={<Dashboard />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
