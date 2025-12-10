
import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './services/authService';
import { DataProvider } from './contexts/DataContext';

// Pages
import Welcome from './pages/Welcome';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import AddTransaction from './pages/AddTransaction';
import TransactionDetail from './pages/TransactionDetail';
import TransactionView from './pages/TransactionView';
import Records from './pages/Records';
import Settings from './pages/Settings';
import CategoryManager from './pages/CategoryManager';
import BudgetSettings from './pages/BudgetSettings';
import Subscriptions from './pages/Subscriptions';
import NotificationSettings from './pages/NotificationSettings';
import Calendar from './pages/Calendar';
import CreditCardManager from './pages/CreditCardManager';
import Reports from './pages/Reports';
import AddSubscriptionPage from './pages/AddSubscription';

// Layout
import Layout from './components/Layout';

const ProtectedRoute = () => {
  const { user, loading } = useAuth();
  if (loading) return <div className="h-screen bg-black flex items-center justify-center text-white">Loading...</div>;
  return user ? <Outlet /> : <Navigate to="/welcome" />;
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <DataProvider>
        <Router>
          <Routes>
            {/* Public Routes */}
            <Route path="/welcome" element={<Welcome />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />

            {/* Protected Routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<Layout><Dashboard /></Layout>} />
              <Route path="/records" element={<Layout><Records /></Layout>} />
              <Route path="/calendar" element={<Layout><Calendar /></Layout>} />
              <Route path="/view/:id" element={<Layout hideNav><TransactionView /></Layout>} />
              <Route path="/add" element={<Layout hideNav><AddTransaction /></Layout>} />
              <Route path="/edit/:id" element={<Layout hideNav><TransactionDetail /></Layout>} />
              <Route path="/categories" element={<Layout hideNav><CategoryManager /></Layout>} />
              <Route path="/budget" element={<Layout hideNav><BudgetSettings /></Layout>} />
              <Route path="/settings" element={<Layout><Settings /></Layout>} />
              <Route path="/settings/notifications" element={<Layout hideNav><NotificationSettings /></Layout>} />
              <Route path="/settings/creditcards" element={<Layout hideNav><CreditCardManager /></Layout>} />
              <Route path="/reports" element={<Layout><Reports /></Layout>} />
              <Route path="/subscriptions" element={<Layout hideNav><Subscriptions /></Layout>} />
              <Route path="/add-subscription" element={<Layout hideNav><AddSubscriptionPage /></Layout>} />
              <Route path="/subscriptions/:id/edit" element={<Layout hideNav><AddSubscriptionPage /></Layout>} />
            </Route>

            <Route path="*" element={<Navigate to="/welcome" />} />
          </Routes>
        </Router>
      </DataProvider>
    </AuthProvider>
  );
};

export default App;
