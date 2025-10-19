import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { initializeDB } from '@/database';
import { Dashboard } from '@/pages/Dashboard';
import { GiftList } from '@/pages/GiftList';
import { GiftDetail } from '@/pages/GiftDetail';
import { GiftForm } from '@/pages/GiftForm';
import { PersonList } from '@/pages/PersonList';
import { PersonDetail } from '@/pages/PersonDetail';
import { PersonForm } from '@/pages/PersonForm';
import { Statistics } from '@/pages/Statistics';
import { logger } from '@/utils/logger';

function App() {
  useEffect(() => {
    // データベース初期化
    initializeDB().catch((error) => {
      logger.error('Failed to initialize database:', error);
    });
  }, []);

  return (
    <Router>
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
