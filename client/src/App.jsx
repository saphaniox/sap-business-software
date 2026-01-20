import React, { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { ConfigProvider } from 'antd'
import Welcome from './pages/Welcome'
import Login from './pages/Login'
import Register from './pages/Register'
import CompanyRegister from './pages/CompanyRegister'
import CompanySettings from './pages/CompanySettings'
import PendingApproval from './pages/PendingApproval'
import CompanyApprovals from './pages/CompanyApprovals'
import Dashboard from './pages/Dashboard'
import Products from './pages/Products'
import Sales from './pages/Sales'
import Invoices from './pages/Invoices'
import Users from './pages/Users'
import Returns from './pages/Returns'
import Help from './pages/Help'
import AIAnalytics from './pages/AIAnalytics'
import FraudDetection from './pages/FraudDetection'
import PrivacyPolicy from './pages/PrivacyPolicy'
import TermsConditions from './pages/TermsConditions'
import CookiePolicy from './pages/CookiePolicy'
import RefundPolicy from './pages/RefundPolicy'
import DataProtection from './pages/DataProtection'
import AcceptableUsePolicy from './pages/AcceptableUsePolicy'
import SuperAdminAnnouncements from './pages/SuperAdminAnnouncements'
import SuperAdminTickets from './pages/SuperAdminTickets'
import SuperAdminSettings from './pages/SuperAdminSettings'
import VisitorAnalytics from './pages/VisitorAnalytics'
import CompanyAnnouncements from './pages/CompanyAnnouncements'
import CompanySupportTickets from './pages/CompanySupportTickets'
import { autoVersionCheck } from './utils/cacheManager'
import { initializeAnalytics, trackPageView } from './utils/analytics'
import './styles/global.css'
import './App.css'

// App version for cache busting
const APP_VERSION = '2.1.0';

// Analytics tracking wrapper
function AnalyticsTracker() {
  const location = useLocation();

  useEffect(() => {
    // Track page view on route change
    trackPageView(location.pathname);
  }, [location]);

  return null;
}

function App() {
  useEffect(() => {
    // Auto-clear cache on version change
    autoVersionCheck(APP_VERSION);
    
    // Initialize analytics tracking
    initializeAnalytics();
  }, []);

  return (
    <ConfigProvider>
      <Router>
        <AnalyticsTracker />
        <Routes>
          <Route path="/" element={<Welcome />} />
          <Route path="/login" element={<Login />} />
          {/* Redirect to company registration - users register their own businesses */}
          <Route path="/register" element={<Navigate to="/company-register" replace />} />
          <Route path="/company-register" element={<CompanyRegister />} />
          <Route path="/company-settings" element={<CompanySettings />} />
          <Route path="/pending-approval" element={<PendingApproval />} />
          <Route path="/company-approvals" element={<CompanyApprovals />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/products" element={<Products />} />
          <Route path="/sales" element={<Sales />} />
          <Route path="/invoices" element={<Invoices />} />
          <Route path="/users" element={<Users />} />
          <Route path="/returns" element={<Returns />} />
          <Route path="/help" element={<Help />} />
          <Route path="/ai-analytics" element={<AIAnalytics />} />
          <Route path="/fraud-detection" element={<FraudDetection />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms-conditions" element={<TermsConditions />} />
          <Route path="/cookie-policy" element={<CookiePolicy />} />
          <Route path="/refund-policy" element={<RefundPolicy />} />
          <Route path="/data-protection" element={<DataProtection />} />
          <Route path="/acceptable-use" element={<AcceptableUsePolicy />} />
          <Route path="/superadmin/announcements" element={<SuperAdminAnnouncements />} />
          <Route path="/superadmin/tickets" element={<SuperAdminTickets />} />
          <Route path="/superadmin/settings" element={<SuperAdminSettings />} />
          <Route path="/superadmin/visitor-analytics" element={<VisitorAnalytics />} />
          <Route path="/announcements" element={<CompanyAnnouncements />} />
          <Route path="/support" element={<CompanySupportTickets />} />
        </Routes>
      </Router>
    </ConfigProvider>
  )
}

export default App
