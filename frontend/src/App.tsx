import { Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from './store/store';
import { setCredentials } from './store/slices/authSlice';
import Layout from './components/layout/Layout';
import Login from './features/auth/Login';
import Dashboard from './features/dashboard/Dashboard';
import Customers from './features/customers/Customers';
import Contacts from './features/contacts/Contacts';
import Documents from './features/documents/Documents';
import Emails from './features/emails/Emails';
import Activities from './features/activities/Activities';
import AuditLogs from './features/audit-logs/AuditLogs';
import Opportunities from './features/opportunities/Opportunities';
import Tasks from './features/tasks/Tasks';
import Invoices from './features/invoices/Invoices';
import Profile from './features/profile/Profile';
import Reports from './features/reports/Reports';
import EmailTemplates from './features/email-templates/EmailTemplates';
import Payments from './features/payments/Payments';
import api from './utils/axios';

function App() {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector(
    (state: RootState) => state.auth.isAuthenticated,
  );
  const user = useSelector((state: RootState) => state.auth.user);
  const token = useSelector((state: RootState) => state.auth.token);

  useEffect(() => {
    // Token varsa ama user yoksa, user'ı yükle
    if (token && !user) {
      api
        .get('/auth/profile')
        .then((response) => {
          const userData = response.data.data || response.data;
          // Token'ı koru, sadece user'ı güncelle
          if (userData && userData.id) {
            dispatch(
              setCredentials({
                user: userData,
                token: token,
                refreshToken: localStorage.getItem('refreshToken') || '',
              }),
            );
          }
        })
        .catch(() => {
          // Profile yüklenemezse sessizce devam et (token geçersiz olabilir)
          // Logout yapmıyoruz çünkü kullanıcı hala giriş yapmış olabilir
        });
    }
  }, [token, user, dispatch]);

  return (
    <Routes>
      <Route
        path="/login"
        element={!isAuthenticated ? <Login /> : <Navigate to="/" />}
      />
      <Route
        path="/*"
        element={
          isAuthenticated ? (
            <Layout>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/customers" element={<Customers />} />
                <Route path="/contacts" element={<Contacts />} />
                <Route path="/documents" element={<Documents />} />
                <Route path="/emails" element={<Emails />} />
                <Route path="/activities" element={<Activities />} />
                <Route path="/audit-logs" element={<AuditLogs />} />
                <Route path="/opportunities" element={<Opportunities />} />
                <Route path="/tasks" element={<Tasks />} />
                <Route path="/invoices" element={<Invoices />} />
                <Route path="/reports" element={<Reports />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/email-templates" element={<EmailTemplates />} />
                <Route path="/payments" element={<Payments />} />
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </Layout>
          ) : (
            <Navigate to="/login" />
          )
        }
      />
    </Routes>
  );
}

export default App;
