import React, { useEffect, useState } from 'react'
import { Layout, Menu, Button, Avatar, Dropdown, Tooltip, Drawer, Alert } from 'antd'
import { useNavigate } from 'react-router-dom'
import {
  DashboardOutlined, ShoppingOutlined, FileOutlined, ShopOutlined,
  UserOutlined, TeamOutlined, UsergroupAddOutlined,
  LineChartOutlined, DatabaseOutlined, DollarOutlined, HistoryOutlined,
  MenuFoldOutlined, MenuUnfoldOutlined, LogoutOutlined,
  SettingOutlined, QuestionCircleOutlined, CheckCircleOutlined, BugOutlined,
  MailOutlined, InfoCircleOutlined, ThunderboltOutlined, SafetyOutlined, BarChartOutlined
} from '@ant-design/icons'
import { useAuthStore } from '../store/authStore'
import BackToTop from '../components/BackToTop'
import NotificationsCenter from '../components/NotificationsCenter'
import DashboardContent from '../components/DashboardContent'
import SuperAdminDashboard from './SuperAdminDashboard'
import AuditLogs from './AuditLogs'
import Footer from '../components/Footer'
import AIChatbot from '../components/AIChatbot'
import Products from './Products'
import Customers from './Customers'
import Sales from './Sales'
import Invoices from './Invoices'
import Users from './Users'
import Returns from './Returns'
import Backup from './Backup'
import Profile from './Profile'
import Analytics from './Analytics'
import AIAnalytics from './AIAnalytics'
import FraudDetection from './FraudDetection'
import Debug from './Debug'
import VisitorAnalytics from './VisitorAnalytics'
import Expenses from './Expenses'
import Help from './Help'
import CompanyApprovals from './CompanyApprovals'
import AllUsersManagement from './AllUsersManagement'
import CompanyManagement from './CompanyManagement'
import CompanySettings from './CompanySettings'
import EmailManagement from './EmailManagement'
import { appConfig } from '../styles/theme'
import logo from '../assets/logo.png'

const { Header, Sider, Content } = Layout
const API_BASE_URL = (import.meta.env.VITE_API_URL || 'https://sap-business-management-software.koyeb.app').replace('/api', '')

function Dashboard() {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()
  const [collapsed, setCollapsed] = useState(false)
  const [currentPage, setCurrentPage] = useState(() => {
    // Restore last page from localStorage on mount
    return localStorage.getItem('currentPage') || 'dashboard'
  })
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768)
  const [mobileDrawerVisible, setMobileDrawerVisible] = useState(false)

  // Save current page to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('currentPage', currentPage)
  }, [currentPage])

  useEffect(() => {
    // Verify authentication only on mount
    if (!user) {
      console.warn('No user found in Dashboard, redirecting to login');
      navigate('/login')
      return;
    }

    // Verify token exists
    const token = localStorage.getItem('token');
    if (!token) {
      console.warn('No token found in Dashboard, redirecting to login');
      logout();
      navigate('/login')
      return;
    }

    // Log current user status for debugging
    console.log('Dashboard loaded for:', {
      username: user.username,
      role: user.role,
      isSuperAdmin: user.isSuperAdmin,
      hasToken: !!token
    });

    // Handle window resize
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768)
      if (window.innerWidth > 768) {
        setMobileDrawerVisible(false)
      }
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [user, navigate, logout])

  const handleLogout = () => {
    // Clear current page from localStorage on logout
    localStorage.removeItem('currentPage')
    logout()
    navigate('/login', { replace: true })
  }

  const menuItems = [
    {
      key: 'dashboard',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
      onClick: () => setCurrentPage('dashboard')
    },
    {
      key: 'analytics',
      icon: <LineChartOutlined />,
      label: 'Analytics',
      onClick: () => setCurrentPage('analytics'),
      tenantOnly: true  // Only for company users, not super admin
    },
    {
      key: 'ai-analytics',
      icon: <ThunderboltOutlined />,
      label: 'AI Insights',
      onClick: () => setCurrentPage('ai-analytics'),
      tenantOnly: true  // Only for company users, not super admin
    },
    {
      key: 'products',
      icon: <ShoppingOutlined />,
      label: 'Products',
      onClick: () => setCurrentPage('products')
    },
    {
      key: 'customers',
      icon: <UserOutlined />,
      label: 'Customers',
      onClick: () => setCurrentPage('customers')
    },
    {
      key: 'sales',
      icon: <ShoppingOutlined />,
      label: 'Sales Orders',
      onClick: () => setCurrentPage('sales')
    },
    {
      key: 'invoices',
      icon: <FileOutlined />,
      label: 'Invoices',
      onClick: () => setCurrentPage('invoices')
    },
    {
      key: 'returns',
      icon: <FileOutlined />,
      label: 'Returns & Refunds',
      onClick: () => setCurrentPage('returns')
    },
    {
      key: 'expenses',
      icon: <DollarOutlined />,
      label: 'Expenses',
      onClick: () => setCurrentPage('expenses')
    },
    {
      key: 'fraud-detection',
      icon: <SafetyOutlined />,
      label: 'Fraud Detection',
      onClick: () => setCurrentPage('fraud-detection'),
      adminOnly: true
    },
    {
      key: 'users',
      icon: <TeamOutlined />,
      label: 'Users',
      onClick: () => setCurrentPage('users'),
      adminOnly: true
    },
    {
      key: 'company-settings',
      icon: <SettingOutlined />,
      label: 'Business Settings',
      onClick: () => setCurrentPage('company-settings'),
      adminOnly: true
    },
    {
      key: 'approvals',
      icon: <CheckCircleOutlined />,
      label: 'Company Approvals',
      onClick: () => setCurrentPage('approvals'),
      superAdminOnly: true
    },
    {
      key: 'all-users',
      icon: <UsergroupAddOutlined />,
      label: 'All Users',
      onClick: () => setCurrentPage('all-users'),
      superAdminOnly: true
    },
    {
      key: 'company-management',
      icon: <ShopOutlined />,
      label: 'Manage Companies',
      onClick: () => setCurrentPage('company-management'),
      superAdminOnly: true
    },
    {
      key: 'email-management',
      icon: <MailOutlined />,
      label: 'Email Management',
      onClick: () => setCurrentPage('email-management'),
      superAdminOnly: true
    },
    {
      key: 'audit-logs',
      icon: <HistoryOutlined />,
      label: 'Audit Logs',
      onClick: () => setCurrentPage('audit-logs'),
      superAdminOnly: true
    },
    {
      key: 'backup',
      icon: <DatabaseOutlined />,
      label: 'Backup & Restore',
      onClick: () => setCurrentPage('backup'),
      adminOnly: true
    },
    {
      key: 'debug',
      icon: <BugOutlined />,
      label: 'Debug',
      onClick: () => setCurrentPage('debug'),
      superAdminOnly: true
    },
    {
      key: 'visitor-analytics',
      icon: <BarChartOutlined />,
      label: 'Visitor Analytics',
      onClick: () => setCurrentPage('visitor-analytics'),
      superAdminOnly: true
    },
    {
      key: 'help',
      icon: <QuestionCircleOutlined />,
      label: 'Help & Docs',
      onClick: () => setCurrentPage('help')
    }
  ]

  // Filter menu items based on user role
  const filteredMenuItems = menuItems.filter(item => {
    // Super admin gets only management items and dashboard (no tenant-specific items)
    if (user?.role === 'superadmin' || user?.isSuperAdmin) {
      // Hide tenant-only items from super admins
      if (item.tenantOnly) return false
      return item.superAdminOnly || item.key === 'dashboard' || item.key === 'help'
    }
    
    // Only show super admin-only items to super admin
    if (item.superAdminOnly) {
      return false
    }
    
    // Business Settings - check permissions
    if (item.key === 'company-settings') {
      return user?.is_company_admin || 
             user?.role === 'admin' || 
             user?.permissions?.canAccessCompanySettings
    }
    
    // Only show admin-only items to admins (including Users page)
    if (item.adminOnly) {
      return user?.role === 'admin'
    }
    
    // Backup is admin-only (Debug is super admin only via superAdminOnly flag)
    if (item.key === 'backup' && user?.role !== 'admin') return false
    
    // Admin and Manager can see all items
    if (user?.role === 'admin' || user?.role === 'manager') return true
    
    // Sales can see all except customers (based on business logic)
    if (user?.role === 'sales') {
      return ['dashboard', 'analytics', 'ai-analytics', 'products', 'sales', 'invoices', 'help'].includes(item.key)
    }
    
    return false
  })

  const userMenu = {
    items: [
      {
        key: 'profile',
        icon: <UserOutlined />,
        label: 'My Profile',
        onClick: () => setCurrentPage('profile')
      },
      {
        key: 'user-info',
        label: `${user?.username} (${user?.role || 'user'})`,
        disabled: true,
        style: { cursor: 'default', opacity: 0.6 }
      },
      { type: 'divider' },
      {
        key: 'logout',
        icon: <LogoutOutlined />,
        label: 'Logout',
        onClick: handleLogout
      }
    ]
  }

  const renderContent = () => {
    // Super Admin gets special dashboard
    if (currentPage === 'dashboard' && (user?.isSuperAdmin || user?.role === 'superadmin')) {
      return <SuperAdminDashboard onNavigate={setCurrentPage} />
    }

    // Super admins cannot access company-specific pages (they don't have a company_id)
    if (user?.isSuperAdmin || user?.role === 'superadmin') {
      const blockedTenantPages = ['analytics', 'products', 'customers', 'sales', 'invoices', 'returns', 'expenses'];
      if (blockedTenantPages.includes(currentPage)) {
        message.warning('Super admins cannot access company-specific pages. Use Visitor Analytics instead.');
        setCurrentPage('visitor-analytics');
        return <VisitorAnalytics />
      }
    }

    switch(currentPage) {
      case 'analytics':
        return <Analytics />
      case 'ai-analytics':
        return <AIAnalytics />
      case 'products':
        return <Products />
      case 'customers':
        return <Customers />
      case 'sales':
        return <Sales />
      case 'invoices':
        return <Invoices />
      case 'returns':
        return <Returns />
      case 'expenses':
        return <Expenses />
      case 'fraud-detection':
        return <FraudDetection />
      case 'help':
        return <Help />
      case 'users':
        return <Users />
      case 'approvals':
        return <CompanyApprovals />
      case 'all-users':
        return <AllUsersManagement />
      case 'company-management':
        return <CompanyManagement />
      case 'email-management':
        return <EmailManagement />
      case 'audit-logs':
        return <AuditLogs />
      case 'backup':
        return <Backup />
      case 'company-settings':
        return <CompanySettings />
      case 'profile':
        return <Profile />
      case 'debug':
        return <Debug />
      case 'visitor-analytics':
        return <VisitorAnalytics />
      default:
        return <DashboardContent page={currentPage} onNavigate={setCurrentPage} />
    }
  }

  return (
    <Layout style={{ height: '100vh' }}>
      {/* Desktop Sider */}
      {!isMobile && (
        <Sider 
          trigger={null} 
          collapsible 
          collapsed={collapsed} 
          style={{ 
            background: '#001529', 
            position: 'fixed', 
            height: '100vh', 
            left: 0, 
            top: 0, 
            zIndex: 1000,
            display: 'flex',
            flexDirection: 'column',
            overflowY: 'auto',
            overflowX: 'hidden'
          }}
          width={200}
          collapsedWidth={80}
        >
          <div className="sidebar-brand" style={{ 
            color: 'white', 
            padding: collapsed ? '24px 10px' : '24px 20px', 
            textAlign: 'center', 
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            transition: 'all 0.2s',
            flexShrink: 0
          }}>
            <img 
              src={user?.company?.logo_url ? `${API_BASE_URL}${user.company.logo_url}` : logo} 
              alt={user?.company?.business_name || "SAP Business Management Software"} 
              style={{ 
                height: collapsed ? '40px' : '50px', 
                marginBottom: collapsed ? '0' : '12px', 
                transition: 'all 0.2s',
                objectFit: 'contain',
                backgroundColor: user?.company?.logo_url ? 'white' : 'transparent',
                padding: user?.company?.logo_url ? '5px' : '0',
                borderRadius: user?.company?.logo_url ? '4px' : '0'
              }} 
            />
            {!collapsed && (
              <h2 style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: '700', letterSpacing: '-0.2px', lineHeight: '1.3' }}>{user?.company?.business_name || appConfig.shopName}</h2>
            )}
          </div>
          <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
            <Menu theme="dark" mode="inline" items={filteredMenuItems} style={{ border: 'none' }} />
          </div>
        </Sider>
      )}

      {/* Mobile Drawer Menu */}
      {isMobile && (
        <Drawer
          title={
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px' }}>
              <img src={logo} alt="SAP Business Management Software" style={{ height: '30px', objectFit: 'contain' }} />
              <span style={{ fontWeight: '600' }}>{appConfig.shopName}</span>
            </div>
          }
          placement="left"
          onClose={() => setMobileDrawerVisible(false)}
          open={mobileDrawerVisible}
          width={Math.min(280, window.innerWidth * 0.8)}
          bodyStyle={{ 
            padding: 0, 
            display: 'flex', 
            flexDirection: 'column', 
            height: '100%',
            overflowY: 'auto',
            overflowX: 'hidden'
          }}
        >
          <div style={{ 
            flex: 1, 
            overflowY: 'auto', 
            overflowX: 'hidden',
            WebkitOverflowScrolling: 'touch'
          }}>
            <Menu 
              theme="light" 
              mode="inline" 
              items={filteredMenuItems}
              onClick={() => setMobileDrawerVisible(false)}
              style={{ borderRight: 0 }}
            />
          </div>
          <Menu 
            theme="light" 
            mode="inline" 
            items={[
              {
                key: 'profile',
                icon: <UserOutlined />,
                label: 'My Profile',
                onClick: () => {
                  setCurrentPage('profile')
                  setMobileDrawerVisible(false)
                }
              },
              {
                key: 'logout',
                icon: <LogoutOutlined />,
                label: 'Logout',
                onClick: handleLogout,
                danger: true
              }
            ]}
            style={{ 
              borderTop: '1px solid #f0f0f0', 
              borderRight: 0,
              flexShrink: 0
            }}
          />
        </Drawer>
      )}

      <Layout style={{ marginLeft: !isMobile ? (collapsed ? 80 : 200) : 0, transition: 'all 0.2s' }}>
        <Header style={{ 
          background: '#fff', 
          padding: isMobile ? '0 12px' : '0 20px', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          borderBottom: '1px solid #f0f0f0', 
          height: 'auto', 
          minHeight: isMobile ? '60px' : '64px',
          position: 'sticky',
          top: 0,
          zIndex: 1000,
          overflow: 'visible'
        }}>
          {isMobile ? (
            <Tooltip title="Open menu">
              <Button
                type="text"
                size="large"
                icon={<MenuUnfoldOutlined />}
                onClick={() => setMobileDrawerVisible(true)}
                style={{ fontSize: '18px' }}
              />
            </Tooltip>
          ) : (
            <Tooltip title={collapsed ? 'Expand menu' : 'Collapse menu'}>
              <Button
                type="text"
                size="large"
                icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                onClick={() => setCollapsed(!collapsed)}
                style={{ fontSize: '18px' }}
              />
            </Tooltip>
          )}
          <img 
            src={logo} 
            alt="SAP Business Management Software" 
            style={{ 
              height: isMobile ? '32px' : '40px',
              marginLeft: isMobile ? '8px' : '16px',
              objectFit: 'contain'
            }} 
          />
          <div className="user-section" style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '10px', 
            cursor: 'pointer', 
            marginLeft: 'auto',
            zIndex: 1001
          }}>
            {/* Notifications Center - Only show for regular users, not Super Admin */}
            {!user?.isSuperAdmin && user?.role !== 'superadmin' && <NotificationsCenter />}
            
            <Dropdown 
              menu={userMenu} 
              trigger={['click']} 
              placement="bottomRight"
              getPopupContainer={trigger => trigger.parentElement}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: isMobile ? '6px' : '0' }}>
                <Avatar 
                  size={isMobile ? (window.innerWidth >= 375 && window.innerWidth <= 428 ? 50 : 48) : 40}
                  icon={<UserOutlined />}
                  src={user?.profile_picture && user.profile_picture !== 'profile-picture' ? `${API_BASE_URL}/uploads/profiles/${user.profile_picture}` : undefined}
                  style={{ 
                    border: isMobile ? '4px solid #1890ff' : '1px solid #d9d9d9', 
                    cursor: 'pointer',
                    boxShadow: isMobile ? '0 4px 20px rgba(24, 144, 255, 0.7)' : 'none',
                    flexShrink: 0
                  }}
                >
                  {(!user?.profile_picture || user.profile_picture === 'profile-picture') && user?.username?.charAt(0).toUpperCase()}
                </Avatar>
                {!isMobile && <span>{user?.username}</span>}
              </div>
            </Dropdown>
          </div>
        </Header>

        <Content style={{ 
          margin: '0', 
          overflowY: 'auto', 
          overflowX: 'hidden',
          background: '#f5f5f5', 
          minHeight: 'calc(100vh - 64px)', 
          display: 'flex', 
          flexDirection: 'column'
        }}>
          {/* Test Account Banner */}
          {user?.email === 'test@sbms.com' && (
            <Alert
              message="🚀 Test Account - Shared Demo Environment"
              description="This is a public test account used by many visitors. Password changes and login credential modifications are disabled. Feel free to explore and use all other features!"
              type="info"
              showIcon
              icon={<InfoCircleOutlined />}
              closable
              style={{ 
                margin: '16px 16px 0 16px',
                borderRadius: '8px'
              }}
            />
          )}
          
          <div style={{ flex: 1 }}>
            {renderContent()}
          </div>
          <Footer />
        </Content>
      </Layout>
      <BackToTop />
      <AIChatbot />
    </Layout>
  )
}

export default Dashboard
