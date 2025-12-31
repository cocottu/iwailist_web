import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import { Layout } from '@/components/layout/Layout';
import { PWAInstallPrompt, UpdatePrompt, SyncIndicator } from '@/components/ui';
import { initializeDB } from '@/database';
import { AuthProvider } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { Dashboard } from '@/pages/Dashboard';
import { GiftList } from '@/pages/GiftList';
import { GiftDetail } from '@/pages/GiftDetail';
import { GiftForm } from '@/pages/GiftForm';
import { PersonList } from '@/pages/PersonList';
import { PersonDetail } from '@/pages/PersonDetail';
import { PersonForm } from '@/pages/PersonForm';
import { ReturnList } from '@/pages/ReturnList';
import { ReminderList } from '@/pages/ReminderList';
import { Statistics } from '@/pages/Statistics';
import DataManagement from '@/pages/DataManagement';
import Settings from '@/pages/Settings';
import { DiagnosticsPage } from '@/pages/DiagnosticsPage';
import Login from '@/pages/Login';
import SignUp from '@/pages/SignUp';
import ForgotPassword from '@/pages/ForgotPassword';
import LegalOperator from '@/pages/LegalOperator';
import LegalPrivacy from '@/pages/LegalPrivacy';
import Contact from '@/pages/Contact';
import ContactHistory from '@/pages/ContactHistory';
import ContactManagement from '@/pages/admin/ContactManagement';
import AdminRoute from '@/components/auth/AdminRoute';

function App() {
  useEffect(() => {
    // データベース初期化
    initializeDB().catch((error) => {
      console.error('Failed to initialize database:', error);
    });
  }, []);

  return (
    <Router>
      <AuthProvider>
        {/* Sonner Toaster */}
        <Toaster 
          position="top-right" 
          richColors 
          closeButton 
          expand={true}
          toastOptions={{
            duration: 3000,
            style: {
              fontSize: '14px',
            },
          }}
        />
        
        {/* PWA関連のUI */}
        <PWAInstallPrompt />
        <UpdatePrompt />
        <SyncIndicator />
        
        <Routes>
          {/* 認証不要のルート */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          
          {/* 法務ページ（認証不要） */}
          <Route path="/legal/operator" element={
            <Layout>
              <LegalOperator />
            </Layout>
          } />
          <Route path="/legal/privacy" element={
            <Layout>
              <LegalPrivacy />
            </Layout>
          } />
          
          {/* お問い合わせページ（認証推奨だが閲覧は可能） */}
          <Route path="/contact" element={
            <Layout>
              <Contact />
            </Layout>
          } />
          
          {/* 認証保護されたルート */}
          <Route path="/" element={
            <ProtectedRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/gifts" element={
            <ProtectedRoute>
              <Layout>
                <GiftList />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/gifts/new" element={
            <ProtectedRoute>
              <Layout>
                <GiftForm />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/gifts/:id" element={
            <ProtectedRoute>
              <Layout>
                <GiftDetail />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/gifts/:id/edit" element={
            <ProtectedRoute>
              <Layout>
                <GiftForm />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/persons" element={
            <ProtectedRoute>
              <Layout>
                <PersonList />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/persons/new" element={
            <ProtectedRoute>
              <Layout>
                <PersonForm />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/persons/:id" element={
            <ProtectedRoute>
              <Layout>
                <PersonDetail />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/persons/:id/edit" element={
            <ProtectedRoute>
              <Layout>
                <PersonForm />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/returns" element={
            <ProtectedRoute>
              <Layout>
                <ReturnList />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/reminders" element={
            <ProtectedRoute>
              <Layout>
                <ReminderList />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/statistics" element={
            <ProtectedRoute>
              <Layout>
                <Statistics />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/data-management" element={
            <ProtectedRoute>
              <Layout>
                <DataManagement />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/settings" element={
            <ProtectedRoute>
              <Layout>
                <Settings />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/diagnostics" element={
            <ProtectedRoute>
              <Layout>
                <DiagnosticsPage />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/contact/history" element={
            <ProtectedRoute>
              <Layout>
                <ContactHistory />
              </Layout>
            </ProtectedRoute>
          } />
          
          {/* 運営者専用ルート */}
          <Route path="/admin/contacts" element={
            <AdminRoute>
              <Layout>
                <ContactManagement />
              </Layout>
            </AdminRoute>
          } />
          
          <Route path="*" element={
            <ProtectedRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          } />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
