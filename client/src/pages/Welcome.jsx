import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Typography, Row, Col, Card, Space, Collapse, Tag, Avatar, Alert } from 'antd'
import { 
  ShoppingOutlined, 
  BarChartOutlined, 
  TeamOutlined, 
  SafetyOutlined,
  CheckCircleOutlined,
  RocketOutlined,
  ShopOutlined,
  GlobalOutlined,
  DatabaseOutlined,
  CloudServerOutlined,
  PhoneOutlined,
  MailOutlined,
  WhatsAppOutlined,
  QuestionCircleOutlined,
  UserAddOutlined,
  LoginOutlined,
  AppstoreAddOutlined,
  DollarOutlined,
  FileTextOutlined,
  SettingOutlined,
  UserOutlined,
  LockOutlined,
  ThunderboltOutlined,
  SyncOutlined,
  LineChartOutlined,
  QrcodeOutlined,
  FilterOutlined,
  HistoryOutlined,
  DownloadOutlined
} from '@ant-design/icons'
import BackToTop from '../components/BackToTop'
import SAPAIChatbot from '../components/SAPAIChatbot'
import logo from '../assets/logo.png'
import '../styles/welcome.css'

const { Title, Paragraph, Text } = Typography
const { Panel } = Collapse

function Welcome() {
  const navigate = useNavigate()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    setVisible(true)
  }, [])

  const features = [
    {
      icon: <ShoppingOutlined style={{ fontSize: '48px', color: '#1890ff' }} />,
      title: 'Smart Inventory Management',
      description: 'Track products, manage stock levels with automated low stock alerts, demand analytics, and real-time updates across your business.'
    },
    {
      icon: <BarChartOutlined style={{ fontSize: '48px', color: '#52c41a' }} />,
      title: 'Advanced Analytics & Reports',
      description: 'Export to Excel, CSV, PDF. Generate professional sales reports, inventory reports, and financial analytics with one click.'
    },
    {
      icon: <QuestionCircleOutlined style={{ fontSize: '48px', color: '#1890ff' }} />,
      title: 'SAP Business AI Assistant',
      description: 'Get instant answers about system features, policies, and how to use the platform. Available 24/7 on all public pages - your intelligent business companion.'
    },
    {
      icon: <TeamOutlined style={{ fontSize: '48px', color: '#722ed1' }} />,
      title: 'Complete Data Isolation',
      description: 'Each business is completely isolated with enterprise-grade security. Your data is private, secure, and never shared.'
    },
    {
      icon: <UserOutlined style={{ fontSize: '48px', color: '#52c41a' }} />,
      title: 'Auto-Customer Registration',
      description: 'Create sales orders and invoices without mandatory customer details. When you add customer name and phone, they are automatically registered in your database.'
    },
    {
      icon: <DatabaseOutlined style={{ fontSize: '48px', color: '#fa8c16' }} />,
      title: 'Automated Backups',
      description: 'Schedule automatic backups, download backup files, and restore your data with one click. Never lose important information.'
    },
    {
      icon: <SafetyOutlined style={{ fontSize: '48px', color: '#eb2f96' }} />,
      title: 'Advanced Security Features',
      description: 'Role-based access, account lockout protection, password strength validation, activity tracking, and secure authentication.'
    },
    {
      icon: <CloudServerOutlined style={{ fontSize: '48px', color: '#13c2c2' }} />,
      title: 'Real-Time Notifications',
      description: 'In-app notification center with bell icon. Stay updated on low stock, sales, expenses, and important business events.'
    },
    {
      icon: <GlobalOutlined style={{ fontSize: '48px', color: '#faad14' }} />,
      title: 'Multi-Currency Support',
      description: 'Support for 15+ global currencies (UGX, USD, EUR, GBP, KES, TZS, RWF, ZAR, NGN, GHS, INR, AED, SAR, CNY, JPY). Perfect for international businesses.'
    },
    {
      icon: <RocketOutlined style={{ fontSize: '48px', color: '#f5222d' }} />,
      title: 'Keyboard Shortcuts & Auto-Save',
      description: 'Ctrl+S to save, Esc to cancel. Auto-save drafts to localStorage. Work faster with productivity shortcuts.'
    },
    {
      icon: <ShopOutlined style={{ fontSize: '48px', color: '#52c41a' }} />,
      title: '24 Industry-Specific Features',
      description: 'Tailored for retail, restaurant, pharmacy, supermarket, electronics, fashion, hardware, automotive, beauty, bookstore, and more.'
    },
    {
      icon: <PhoneOutlined style={{ fontSize: '48px', color: '#1890ff' }} />,
      title: 'Fully Mobile Responsive',
      description: 'Beautiful responsive design that works perfectly on desktop, tablet, and mobile. Manage your business anywhere, anytime.'
    },
    {
      icon: <FileTextOutlined style={{ fontSize: '48px', color: '#722ed1' }} />,
      title: 'Professional Documents',
      description: 'Generate invoices, receipts, sales reports, inventory reports. Print POS-style receipts with company logo and branding.'
    },
    {
      icon: <DownloadOutlined style={{ fontSize: '48px', color: '#13c2c2' }} />,
      title: 'Individual Document Downloads',
      description: 'Download each sales order and invoice separately as professional PDF files with your company branding. Perfect for sharing with customers.'
    },
    {
      icon: <DollarOutlined style={{ fontSize: '48px', color: '#fa8c16' }} />,
      title: 'Smart Profit Tracking',
      description: 'Automatic profit calculations, profit margins, cost analysis, and financial insights to maximize your business revenue.'
    },
    {
      icon: <ThunderboltOutlined style={{ fontSize: '48px', color: '#faad14' }} />,
      title: 'Lightning-Fast Performance',
      description: 'Optimized for speed with instant search, quick data loading, and smooth transitions. Handle thousands of products and transactions effortlessly.'
    },
    {
      icon: <SyncOutlined style={{ fontSize: '48px', color: '#13c2c2' }} />,
      title: 'Real-Time Sync & Updates',
      description: 'All changes sync instantly across all users. See updates in real-time with live data refresh and automatic synchronization.'
    },
    {
      icon: <LineChartOutlined style={{ fontSize: '48px', color: '#52c41a' }} />,
      title: 'Demand Analytics & Forecasting',
      description: 'Predict future demand with AI-powered analytics. Identify trending products, seasonal patterns, and optimize your inventory planning.'
    },
    {
      icon: <QrcodeOutlined style={{ fontSize: '48px', color: '#722ed1' }} />,
      title: 'Barcode Scanning Support',
      description: 'Scan barcodes to quickly add products, process sales, and manage inventory. Supports QR codes, EAN, UPC, and multiple formats.'
    },
    {
      icon: <FilterOutlined style={{ fontSize: '48px', color: '#1890ff' }} />,
      title: 'Advanced Filtering & Search',
      description: 'Find anything instantly with powerful search and multi-criteria filtering. Sort by date, amount, category, status, and more.'
    },
    {
      icon: <HistoryOutlined style={{ fontSize: '48px', color: '#eb2f96' }} />,
      title: 'Complete Audit Trail',
      description: 'Track every action with detailed edit history. See who made changes, when, and what was modified for complete accountability.'
    }
  ]

  const benefits = [
    'Multi-tenant architecture with complete data isolation',
    'SAP Business AI Assistant for instant system help',
    'Auto-customer registration from sales and invoices',
    'Individual PDF downloads for sales orders and invoices',
    'Optional customer fields - create orders without customer details',
    'Real-time inventory tracking with demand analytics',
    'Automated profit calculations and financial reports',
    'Export to Excel, CSV, PDF with one click',
    'Professional invoice & POS receipt generation',
    'Multi-currency support (15+ currencies)',
    'In-app notification center with real-time alerts',
    'Role-based access control (Admin, Manager, Staff)',
    'Automated backup & one-click restore',
    'Keyboard shortcuts & auto-save functionality',
    'Mobile-responsive design for all devices',
    'Company logo branding on all documents',
    'Loading skeletons for better UX',
    'Advanced search and filtering',
    'Edit history and audit trails',
    'Custom pricing per transaction',
    'Barcode scanning for products',
    'Real-time data synchronization',
    'Lightning-fast performance',
    'Demand forecasting and analytics',
    'Product category management',
    'Low stock alerts and warnings',
    'Customer purchase history tracking',
    'Returns and refunds management',
    'Expense categorization and tracking',
    'Dashboard with key metrics',
    'Secure data encryption',
    'Regular system updates'
  ]

  const howItWorksSteps = [
    {
      icon: <UserAddOutlined style={{ fontSize: '48px', color: '#1890ff' }} />,
      step: '1',
      title: 'Register Your Business',
      description: 'Sign up with business details, choose from 26 industry types, select your local currency (UGX, USD, EUR, etc.), and create your admin account in minutes.'
    },
    {
      icon: <SettingOutlined style={{ fontSize: '48px', color: '#52c41a' }} />,
      step: '2',
      title: 'Configure & Customize',
      description: 'Upload company logo, add team members with specific roles, customize business settings, set up currency preferences, and configure backup schedules.'
    },
    {
      icon: <AppstoreAddOutlined style={{ fontSize: '48px', color: '#722ed1' }} />,
      step: '3',
      title: 'Build Your Product Catalog',
      description: 'Add products with SKU, categories, cost price, selling price, profit margins, stock quantities. Get instant profit calculations and low stock alerts.'
    },
    {
      icon: <DollarOutlined style={{ fontSize: '48px', color: '#fa8c16' }} />,
      step: '4',
      title: 'Process Sales & Transactions',
      description: 'Make sales with custom pricing, generate professional invoices, print POS receipts with your logo, track payments, and manage customer data effortlessly.'
    },
    {
      icon: <BarChartOutlined style={{ fontSize: '48px', color: '#eb2f96' }} />,
      step: '5',
      title: 'Analyze & Grow',
      description: 'View real-time analytics dashboard, export reports to Excel/PDF, monitor notifications, track profits, analyze trends, and make data-driven business decisions.'
    }
  ]

  const faqItems = [
    {
      key: '1',
      label: '📊 What is SAP Business Management Software?',
      children: (
        <Paragraph>
          SAP Business Management Software is a comprehensive multi-tenant business management solution designed for businesses across all industries. 
          It helps you manage inventory, track sales, handle customer information, manage expenses, generate invoices, and analyze your business performance 
          all in one secure platform. Each business has complete data isolation, ensuring your information remains private and secure.
        </Paragraph>
      )
    },
    {
      key: '2',
      label: '🚀 How do I get started?',
      children: (
        <div>
          <Paragraph>Getting started is simple:</Paragraph>
          <ol style={{ paddingLeft: '20px' }}>
            <li><strong>Register:</strong> Click "Get Started" and fill in your business details including business name, industry type, and administrator information.</li>
            <li><strong>Login:</strong> Use your credentials to access your dashboard.</li>
            <li><strong>Set Up:</strong> Add team members, create user accounts with appropriate roles, and customize your settings.</li>
            <li><strong>Add Products:</strong> Create your product catalog with pricing and stock information.</li>
            <li><strong>Start Operating:</strong> Begin making sales, tracking inventory, and managing your business operations.</li>
          </ol>
        </div>
      )
    },
    {
      key: '3',
      label: 'What types of businesses can use this system?',
      children: (
        <div>
          <Paragraph>Our system supports 26 different business types:</Paragraph>
          <ul style={{ paddingLeft: '20px', columns: 2, gap: '20px' }}>
            <li>Electronics & Appliances</li>
            <li>Fashion & Clothing</li>
            <li>Pharmacy & Healthcare</li>
            <li>Grocery & Supermarket</li>
            <li>Hardware & Construction</li>
            <li>Furniture & Home Decor</li>
            <li>Automotive & Parts</li>
            <li>Restaurant & Food Service</li>
            <li>Beauty & Cosmetics</li>
            <li>Books & Stationery</li>
            <li>Sports & Fitness</li>
            <li>Jewelry & Accessories</li>
            <li>Technology & IT Services</li>
            <li>Wholesale & Distribution</li>
            <li>Plumbing Services</li>
            <li>Water Supply & Treatment</li>
            <li>Electrical Services</li>
            <li>Cleaning Services</li>
            <li>Security Services</li>
            <li>Transport & Logistics</li>
            <li>Agriculture & Farming</li>
            <li>Education & Training</li>
            <li>Hotel & Hospitality</li>
            <li>Real Estate</li>
            <li>General Retail</li>
            <li>Agriculture & Farming</li>
            <li>Furniture & Home D├⌐cor</li>
            <li>Sports & Fitness Equipment</li>
            <li>Printing & Publishing</li>
            <li>Pet Shop & Supplies</li>
            <li>General Merchandise</li>
          </ul>
        </div>
      )
    },
    {
      key: '4',
      label: '🔒 Is my business data secure and private?',
      children: (
        <Paragraph>
          Yes, absolutely! Our system uses complete data isolation architecture. Each business operates in its own secure environment. 
          Your data is completely separate from other businesses - they cannot see or access your information in any way. 
          We implement role-based access control, secure JWT authentication, password hashing, account lockout protection after failed login attempts, 
          and automated backup systems to ensure your data is always safe and recoverable.
        </Paragraph>
      )
    },
    {
      key: '5',
      label: '👥 Can I add multiple users to my business?',
      children: (
        <div>
          <Paragraph>
            <strong>Yes! You can add unlimited users with custom permissions.</strong>
          </Paragraph>
          <Paragraph>
            <strong>Important:</strong> As the business <Tag color="red">Admin</Tag>, <strong style={{ color: '#1890ff' }}>YOU control what each user can do</strong>. 
            The system does NOT set default permissions - you have complete control.
          </Paragraph>
          <Paragraph>
            <strong>How it works:</strong>
          </Paragraph>
          <ul style={{ paddingLeft: '20px', marginBottom: 16 }}>
            <li>✓ Create user accounts and assign roles (Admin, Manager, Sales)</li>
            <li>✓ <strong>Customize permissions</strong> for each user - decide who can:
              <ul style={{ paddingLeft: '20px', marginTop: 8 }}>
                <li>→ Add, edit, or delete products</li>
                <li>→ Add, edit, or delete sales orders</li>
                <li>→ Add, edit, or delete customers and invoices</li>
                <li>→ View reports and analytics</li>
                <li>→ Manage users</li>
                <li>→ Access business settings</li>
              </ul>
            </li>
            <li>✓ Change user permissions anytime using the "Manage Permissions" button</li>
            <li>✓ Reset passwords and delete user accounts</li>
          </ul>
          <Paragraph strong style={{ color: '#52c41a' }}>
            👍 You decide everything - the system gives you full control over who can access what!
          </Paragraph>
        </div>
      )
    },
    {
      key: '6',
      label: '✨ What features are included in the system?',
      children: (
        <div>
          <Paragraph><strong>⚙️ Core Features:</strong></Paragraph>
          <ul style={{ paddingLeft: '20px' }}>
            <li><strong>Product Management:</strong> Add, edit, delete products; manage categories; track stock with low stock alerts; demand analytics; profit margins.</li>
            <li><strong>Sales Management:</strong> Process sales; custom pricing; automatic profit calculations; sales history; edit tracking; currency support.</li>
            <li><strong>Customer Management:</strong> Store customer info; track purchase history; manage relationships; export customer data.</li>
            <li><strong>Invoice & Receipt Generation:</strong> Professional invoices with company logo; POS-style thermal receipts; print or download; multi-currency.</li>
            <li><strong>Expense Tracking:</strong> Record expenses by category; date filters; spending analytics; export to Excel/PDF.</li>
            <li><strong>Advanced Analytics:</strong> Real-time dashboard; sales trends; profit/loss reports; inventory reports; top products; demand analytics.</li>
            <li><strong>User Management:</strong> Add unlimited users; role-based access (Admin, Manager, Staff); activity tracking; permission control.</li>
            <li><strong>Returns Management:</strong> Handle product returns; track refunds; automatic inventory adjustments; return history.</li>
          </ul>
          <Paragraph style={{ marginTop: '16px' }}><strong>🚀 Advanced Features:</strong></Paragraph>
          <ul style={{ paddingLeft: '20px' }}>
            <li><strong>Export Anywhere:</strong> Export to Excel, CSV, PDF with one click on all tables and reports.</li>
            <li><strong>Multi-Currency:</strong> 15+ currencies supported (UGX, USD, EUR, GBP, KES, TZS, RWF, ZAR, NGN, GHS, INR, AED, SAR, CNY, JPY).</li>
            <li><strong>Notifications Center:</strong> In-app bell icon with real-time alerts for low stock, sales, expenses, and system events.</li>
            <li><strong>Automated Backups:</strong> Schedule backups; download backup files; one-click restore; never lose data.</li>
            <li><strong>Keyboard Shortcuts:</strong> Ctrl+S to save, Esc to cancel; work faster with productivity shortcuts.</li>
            <li><strong>Auto-Save Drafts:</strong> Forms auto-save to localStorage; recover unsaved work; "Load Draft" option.</li>
            <li><strong>Loading Skeletons:</strong> Beautiful loading states for better user experience; no blank screens.</li>
            <li><strong>Confirmation Dialogs:</strong> Smart confirmations for destructive actions; prevent accidental deletions.</li>
            <li><strong>Company Branding:</strong> Upload logo; appears on invoices, receipts, and all documents; professional look.</li>
            <li><strong>Edit History:</strong> Track all changes to sales orders; audit trails; see who edited what and when.</li>
            <li><strong>Advanced Search:</strong> Filter by multiple criteria; date ranges; categories; status; quick find.</li>
            <li><strong>Empty States:</strong> Helpful messages when no data; guided actions; better onboarding experience.</li>
          </ul>
        </div>
      )
    },
    {
      key: '7',
      label: '📦 How does inventory management work?',
      children: (
        <Paragraph>
          When you add a product, you specify the initial stock quantity. Every time you make a sale, the system automatically deducts 
          the sold quantity from your inventory. You'll receive low stock alerts when products reach critical levels. You can also manually 
          adjust stock levels, view real-time inventory status, and generate inventory reports to help with restocking decisions.
        </Paragraph>
      )
    },
    {
      key: '8',
      label: 'Can I access the system from my mobile phone?',
      children: (
        <Paragraph>
          Yes! The system is fully responsive and optimized for mobile devices. You can access all features from your smartphone or tablet. 
          The interface automatically adapts to your screen size, ensuring a smooth experience whether you're using a desktop computer, 
          tablet, or mobile phone. Manage your business on-the-go from anywhere, anytime.
        </Paragraph>
      )
    },
    {
      key: '9',
      label: '💰 How are profits calculated?',
      children: (
        <Paragraph>
          Profits are calculated automatically for every sale. The system takes the selling price minus the buying price (cost price) 
          to determine the profit per unit, then multiplies by the quantity sold. All profit calculations are displayed in real-time 
          on your dashboard, sales reports, and analytics. You can view profits by product, date range, or overall business performance.
        </Paragraph>
      )
    },
    {
      key: '10',
      label: '💵 Does the system support multiple currencies?',
      children: (
        <div>
          <Paragraph>
            Yes! The system supports 15+ global currencies. You select your local currency during business registration or change it 
            anytime in Business Settings. All prices, invoices, and reports automatically display in your chosen currency.
          </Paragraph>
          <Paragraph><strong>Supported Currencies:</strong></Paragraph>
          <ul style={{ paddingLeft: '20px', columns: 2, gap: '20px' }}>
            <li>🇺🇬 UGX - Ugandan Shilling</li>
            <li>🇺🇸 USD - US Dollar</li>
            <li>🇪🇺 EUR - Euro</li>
            <li>🇬🇧 GBP - British Pound</li>
            <li>🇰🇪 KES - Kenyan Shilling</li>
            <li>🇹🇿 TZS - Tanzanian Shilling</li>
            <li>🇷🇼 RWF - Rwandan Franc</li>
            <li>🇿🇦 ZAR - South African Rand</li>
            <li>🇳🇬 NGN - Nigerian Naira</li>
            <li>🇬🇭 GHS - Ghanaian Cedi</li>
            <li>🇮🇳 INR - Indian Rupee</li>
            <li>🇦🇪 AED - UAE Dirham</li>
            <li>🇸🇦 SAR - Saudi Riyal</li>
            <li>🇨🇳 CNY - Chinese Yuan</li>
            <li>🇯🇵 JPY - Japanese Yen</li>
          </ul>
        </div>
      )
    },
    {
      key: '11',
      label: '📄 Can I export reports to Excel or PDF?',
      children: (
        <Paragraph>
          Absolutely! Every table in the system has an export button with options to download as Excel (.xlsx), CSV (.csv), or PDF. 
          You can also generate professional reports like Sales Reports, Inventory Reports with color-coded status, and Financial Reports. 
          All exports include your company logo and branding. Perfect for sharing with accountants, partners, or for record-keeping.
        </Paragraph>
      )
    },
    {
      key: '12',
      label: '🔔 How do notifications work?',
      children: (
        <Paragraph>
          The system has an in-app notification center with a bell icon in the top navigation. You'll receive real-time notifications for 
          important events like low stock alerts, new sales, expenses added, user activities, and system updates. Notifications are color-coded 
          by type (success, warning, error, info), show timestamps, and you can mark them as read or delete them. You can also clear all 
          read notifications at once.
        </Paragraph>
      )
    },
    {
      key: '13',
      label: '💬 What if I need help or support?',
      children: (
        <div>
          <Paragraph>We offer multiple support channels:</Paragraph>
          <ul style={{ paddingLeft: '20px' }}>
            <li><strong>Phone Support:</strong> Call us at +256 706 564 628 during business hours</li>
            <li><strong>Email Support:</strong> Send inquiries to saptechnologies256@gmail.com</li>
            <li><strong>WhatsApp Support:</strong> Chat with us instantly on WhatsApp for quick assistance</li>
            <li><strong>In-App Help:</strong> Access detailed documentation, FAQs, and guides within the system</li>
            <li><strong>Video Tutorials:</strong> Watch step-by-step video guides (coming soon)</li>
          </ul>
          <Paragraph>Our support team is ready to help you with setup, training, troubleshooting, and any questions you may have.</Paragraph>
        </div>
      )
    },
    {
      key: '14',
      label: '📱 How does barcode scanning work?',
      children: (
        <div>
          <Paragraph>
            Our system includes built-in barcode scanning to speed up product management! Simply click the <strong>"Scan Barcode"</strong> button 
            on the Products page, and your device camera will open. Point it at any barcode or QR code, and the system will automatically 
            search for matching products.
          </Paragraph>
          <Paragraph><strong>Supported Barcode Formats:</strong></Paragraph>
          <ul style={{ paddingLeft: '20px' }}>
            <li><strong>QR Code</strong> - Quick Response codes</li>
            <li><strong>EAN-13</strong> - European Article Number (13 digits)</li>
            <li><strong>EAN-8</strong> - European Article Number (8 digits)</li>
            <li><strong>UPC-A</strong> - Universal Product Code (12 digits)</li>
            <li><strong>UPC-E</strong> - Universal Product Code (compact)</li>
            <li><strong>Code 128</strong> - High-density linear barcode</li>
            <li><strong>Code 39</strong> - Alphanumeric barcode</li>
          </ul>
          <Paragraph>
            <strong>How to use it:</strong> When adding or managing products, enter the barcode number as the SKU/Code. 
            Then use the scanner to quickly find products by scanning their physical barcode. Perfect for retail stores, 
            warehouses, and inventory management!
          </Paragraph>
        </div>
      )
    },
    {
      key: '15',
      label: '⚡ What are keyboard shortcuts?',
      children: (
        <div>
          <Paragraph>
            Work faster with our productivity keyboard shortcuts! These time-savers help you navigate and perform actions quickly:
          </Paragraph>
          <ul style={{ paddingLeft: '20px' }}>
            <li><strong>Ctrl+S</strong> - Save forms and changes instantly</li>
            <li><strong>Esc</strong> - Cancel or close modals/dialogs</li>
            <li><strong>Enter</strong> - Submit forms when focused on input fields</li>
          </ul>
          <Paragraph>
            <strong>Auto-Save Feature:</strong> Forms automatically save drafts to your browser's local storage. If you accidentally 
            close a form or your browser crashes, you'll see a "Load Draft" option to recover your unsaved work. No more losing data!
          </Paragraph>
        </div>
      )
    },
    {
      key: '16',
      label: '🔄 How does real-time sync work?',
      children: (
        <Paragraph>
          All changes in the system sync instantly across all users in your business. When you or a team member adds a sale, 
          updates inventory, or makes any change, everyone sees it immediately without refreshing the page. This ensures your 
          entire team always works with the latest, most accurate data. Perfect for businesses with multiple users or locations!
        </Paragraph>
      )
    },
    {
      key: '17',
      label: '📈 What is demand forecasting?',
      children: (
        <div>
          <Paragraph>
            Our advanced analytics engine tracks your sales patterns and predicts future demand for each product. This helps you:
          </Paragraph>
          <ul style={{ paddingLeft: '20px' }}>
            <li>Identify trending products and bestsellers</li>
            <li>Spot seasonal patterns in sales</li>
            <li>Optimize inventory levels to avoid overstocking or stockouts</li>
            <li>Make data-driven purchasing decisions</li>
            <li>Plan promotions based on demand trends</li>
          </ul>
          <Paragraph>
            Access demand analytics from the Dashboard and Analytics pages to see which products are in high demand, 
            sales velocity, and forecasted stock needs.
          </Paragraph>
        </div>
      )
    }
  ]

  return (
    <div className={`welcome-page ${visible ? 'visible' : ''}`}>
      {/* Hero Section */}
      <div className="hero-section">
        <div className="hero-content">
          <div className="logo-section">
            <img 
              src={logo} 
              alt="SAP Business Management Software" 
              style={{ 
                height: '100px', 
                width: 'auto',
                maxWidth: '90%',
                marginBottom: '24px',
                objectFit: 'contain',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                padding: '10px',
                borderRadius: '8px'
              }} 
            />
            <Title level={1} style={{ margin: '16px 0', color: '#fff', fontSize: 'clamp(24px, 6vw, 48px)' }}>
              SAP Business Management Software
            </Title>
          </div>
          <Paragraph style={{ fontSize: 'clamp(16px, 4vw, 20px)', color: '#e6f7ff', marginBottom: '32px' }}>
            Complete Business Management Solution • Multi-Currency • Real-Time Analytics • Automated Backups
          </Paragraph>
          <Title level={3} style={{ color: '#e6f7ff', fontWeight: 'normal', marginBottom: '48px', fontSize: 'clamp(14px, 3vw, 20px)' }}>
            Complete data isolation • Export to Excel/PDF • 15+ Currencies • In-app Notifications • Keyboard Shortcuts
          </Title>
          <Space size="large" className="hero-buttons" wrap style={{ justifyContent: 'center' }}>
            <Button 
              type="primary" 
              size="large" 
              icon={<RocketOutlined />}
              onClick={() => navigate('/company-register')}
              style={{ height: '50px', fontSize: '16px', padding: '0 40px' }}
              className="hero-btn"
            >
              Register Your Company / Business
            </Button>
            <Button 
              size="large"
              onClick={() => navigate('/login')}
              style={{ 
                height: '50px', 
                fontSize: '16px', 
                padding: '0 40px',
                background: 'rgba(255,255,255,0.2)',
                border: '1px solid #fff',
                color: '#fff'
              }}
              className="hero-btn"
            >
              Login
            </Button>
            <Button 
              size="large"
              icon={<QuestionCircleOutlined />}
              onClick={() => navigate('/help')}
              style={{ 
                height: '50px', 
                fontSize: '16px', 
                padding: '0 40px',
                background: 'rgba(255,255,255,0.1)',
                border: '2px solid #52c41a',
                color: '#fff'
              }}
              className="hero-btn"
            >
              Help & Docs
            </Button>
          </Space>
        </div>
      </div>

      {/* Features Section */}
      <div className="features-section">
        <div className="container">
          <Title level={2} style={{ textAlign: 'center', marginBottom: '48px' }}>
            Powerful Features for Your Business
          </Title>
          <Row gutter={[32, 32]}>
            {features.map((feature, index) => (
              <Col xs={24} sm={12} lg={6} key={index}>
                <Card 
                  className="feature-card"
                  hoverable
                  style={{ height: '100%', textAlign: 'center' }}
                >
                  <div style={{ marginBottom: '16px' }}>{feature.icon}</div>
                  <Title level={4}>{feature.title}</Title>
                  <Paragraph style={{ color: '#666' }}>{feature.description}</Paragraph>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="benefits-section">
        <div className="container">
          <Row gutter={48} align="middle">
            <Col xs={24} lg={12}>
              <Title level={2} style={{ marginBottom: '24px' }}>
                Why Choose Our System?
              </Title>
              <Paragraph style={{ fontSize: '16px', marginBottom: '32px', color: '#666' }}>
                The most advanced business management system for modern businesses worldwide. From small shops to large enterprises, 
                we provide enterprise-grade features at affordable prices. Manage inventory, track sales in multiple currencies, 
                analyze profits with advanced analytics, export reports to Excel/PDF, receive real-time notifications, 
                and grow your business with confidence. Complete data isolation ensures your business data stays private and secure.
              </Paragraph>
              <div className="benefits-list">
                {benefits.map((benefit, index) => (
                  <div key={index} className="benefit-item">
                    <CheckCircleOutlined style={{ color: '#52c41a', fontSize: '20px', marginRight: '12px' }} />
                    <span style={{ fontSize: '16px' }}>{benefit}</span>
                  </div>
                ))}
              </div>
            </Col>
            <Col xs={24} lg={12}>
              <div className="stats-grid">
                <Card className="stat-card">
                  <div className="stat-number">15+</div>
                  <div className="stat-label">Global Currencies</div>
                </Card>
                <Card className="stat-card">
                  <div className="stat-number">26</div>
                  <div className="stat-label">Industry Types</div>
                </Card>
                <Card className="stat-card">
                  <div className="stat-number">24/7</div>
                  <div className="stat-label">Access Anytime</div>
                </Card>
                <Card className="stat-card">
                  <div className="stat-number">100%</div>
                  <div className="stat-label">Data Isolated</div>
                </Card>
              </div>
            </Col>
          </Row>
        </div>
      </div>

      {/* How It Works Section */}
      <div style={{ padding: '80px 20px', backgroundColor: '#f0f2f5' }}>
        <div className="container">
          <Title level={2} style={{ textAlign: 'center', marginBottom: '16px' }}>
            ⚙️ How It Works
          </Title>
          <Paragraph style={{ textAlign: 'center', fontSize: '16px', color: '#666', marginBottom: '60px', maxWidth: '700px', margin: '0 auto 60px' }}>
            Get started with our simple 5-step process and take your business to the next level
          </Paragraph>
          <Row gutter={[32, 32]}>
            {howItWorksSteps.map((item, index) => (
              <Col xs={24} sm={12} lg={8} key={index}>
                <Card 
                  className="feature-card" 
                  style={{ 
                    height: '100%', 
                    textAlign: 'center',
                    position: 'relative',
                    overflow: 'visible'
                  }}
                >
                  <div style={{
                    position: 'absolute',
                    top: '-20px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    backgroundColor: '#1890ff',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '20px',
                    fontWeight: 'bold'
                  }}>
                    {item.step}
                  </div>
                  <div style={{ marginTop: '30px' }}>{item.icon}</div>
                  <Title level={4} style={{ margin: '16px 0' }}>{item.title}</Title>
                  <Paragraph style={{ color: '#666' }}>{item.description}</Paragraph>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      </div>

      {/* FAQ Section */}
      <div style={{ padding: '80px 20px', backgroundColor: '#fff' }}>
        <div className="container">
          <Title level={2} style={{ textAlign: 'center', marginBottom: '16px' }}>
            💡 <QuestionCircleOutlined /> Frequently Asked Questions
          </Title>
          <Paragraph style={{ textAlign: 'center', fontSize: '16px', color: '#666', marginBottom: '48px', maxWidth: '700px', margin: '0 auto 48px' }}>
            Everything you need to know about our business management system
          </Paragraph>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <Collapse 
              accordion 
              size="large"
              style={{ 
                backgroundColor: '#fff',
                border: '1px solid #d9d9d9'
              }}
            >
              {faqItems.map(item => (
                <Panel 
                  header={<span style={{ fontSize: '16px', fontWeight: '500' }}>{item.label}</span>} 
                  key={item.key}
                >
                  {item.children}
                </Panel>
              ))}
            </Collapse>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="cta-section">
        <div className="container" style={{ textAlign: 'center' }}>
          <GlobalOutlined style={{ fontSize: '64px', color: '#1890ff', marginBottom: '24px' }} />
          <Title level={2} style={{ marginBottom: '16px' }}>
            Ready to Transform Your Business?
          </Title>
          <Paragraph style={{ fontSize: '18px', marginBottom: '32px', color: '#666' }}>
            Join us today and experience modern business management
          </Paragraph>
          <Space size="large" className="cta-buttons">
            <Button 
              type="primary" 
              size="large"
              icon={<RocketOutlined />}
              onClick={() => navigate('/company-register')}
              style={{ height: '50px', fontSize: '16px', padding: '0 40px' }}
              className="cta-btn"
            >
              Register Your Company / Business
            </Button>
            <Button 
              size="large"
              onClick={() => navigate('/login')}
              style={{ height: '50px', fontSize: '16px', padding: '0 40px' }}
              className="cta-btn"
            >
              I Have an Account
            </Button>
          </Space>
        </div>
      </div>

      {/* Test Account Section */}
      <div style={{ 
        backgroundColor: '#f0f9ff', 
        padding: '60px 20px',
        borderTop: '3px solid #1890ff'
      }}>
        <div className="container" style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <Row gutter={[32, 32]} align="middle">
            <Col xs={24} md={12}>
              <div style={{ textAlign: 'left' }}>
                <Tag color="blue" style={{ marginBottom: '16px', fontSize: '14px', padding: '4px 12px' }}>
                  👉 TRY BEFORE YOU BUY
                </Tag>
                <Title level={2} style={{ marginBottom: '16px', color: '#1890ff' }}>
                  Test Drive with Test Account
                </Title>
                <Paragraph style={{ fontSize: '16px', marginBottom: '24px', color: '#555' }}>
                  Experience the full power of SAP Business Management Software with our pre-configured test account. 
                  Explore all features, test workflows, and see how it can transform your business operations.
                </Paragraph>
                <ul style={{ 
                  listStyle: 'none', 
                  padding: 0, 
                  marginBottom: '24px',
                  fontSize: '15px'
                }}>
                  <li style={{ marginBottom: '12px', color: '#555' }}>
                    <CheckCircleOutlined style={{ color: '#52c41a', marginRight: '8px' }} />
                    Pre-loaded sample data including products, customers, and sales
                  </li>
                  <li style={{ marginBottom: '12px', color: '#555' }}>
                    <CheckCircleOutlined style={{ color: '#52c41a', marginRight: '8px' }} />
                    Full access to all features and modules
                  </li>
                  <li style={{ marginBottom: '12px', color: '#555' }}>
                    <CheckCircleOutlined style={{ color: '#52c41a', marginRight: '8px' }} />
                    Real-time analytics and reporting dashboard
                  </li>
                  <li style={{ marginBottom: '12px', color: '#555' }}>
                    <CheckCircleOutlined style={{ color: '#52c41a', marginRight: '8px' }} />
                    Test inventory management, invoicing, and more
                  </li>
                  <li style={{ marginBottom: '12px', color: '#555' }}>
                    <CheckCircleOutlined style={{ color: '#52c41a', marginRight: '8px' }} />
                    No credit card required • No time limit
                  </li>
                </ul>
              </div>
            </Col>
            <Col xs={24} md={12}>
              <Card 
                style={{ 
                  borderRadius: '12px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  border: '2px solid #1890ff'
                }}
              >
                <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                  <Avatar 
                    size={64} 
                    icon={<UserOutlined />} 
                    style={{ backgroundColor: '#1890ff', marginBottom: '16px' }}
                  />
                  <Title level={4} style={{ marginBottom: '8px', color: '#1890ff' }}>
                    Test Account Credentials
                  </Title>
                  <Paragraph type="secondary" style={{ marginBottom: 0 }}>
                    Use these credentials to login and explore
                  </Paragraph>
                </div>
                
                <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                  <div style={{ 
                    backgroundColor: '#f5f5f5', 
                    padding: '16px', 
                    borderRadius: '8px',
                    border: '1px solid #d9d9d9'
                  }}>
                    <Text strong style={{ display: 'block', marginBottom: '8px', color: '#666' }}>
                      <MailOutlined /> Username or Email
                    </Text>
                    <Text 
                      copyable 
                      style={{ 
                        fontSize: '16px', 
                        color: '#1890ff',
                        fontWeight: '600'
                      }}
                    >
                      test@sbms.com
                    </Text>
                  </div>
                  
                  <div style={{ 
                    backgroundColor: '#f5f5f5', 
                    padding: '16px', 
                    borderRadius: '8px',
                    border: '1px solid #d9d9d9'
                  }}>
                    <Text strong style={{ display: 'block', marginBottom: '8px', color: '#666' }}>
                      <LockOutlined /> Password
                    </Text>
                    <Text 
                      copyable 
                      style={{ 
                        fontSize: '16px', 
                        color: '#1890ff',
                        fontWeight: '600'
                      }}
                    >
                      sbms@2026
                    </Text>
                  </div>
                  
                  <Button 
                    type="primary" 
                    size="large"
                    block
                    icon={<LoginOutlined />}
                    onClick={() => navigate('/login')}
                    style={{ 
                      height: '48px', 
                      fontSize: '16px',
                      marginTop: '8px'
                    }}
                  >
                    Login to Test Account
                  </Button>
                  
                  <Alert
                    message="Test Account Notice"
                    description="This is a shared test account. Any changes you make may be visible to other users testing the system. Data is reset periodically."
                    type="info"
                    showIcon
                    style={{ marginTop: '8px' }}
                  />
                </Space>
              </Card>
            </Col>
          </Row>
        </div>
      </div>

      {/* Footer */}
      <div className="welcome-footer" style={{ backgroundColor: '#001529', color: '#fff', padding: '60px 20px 20px' }}>
        <div className="container">
          <Row gutter={[32, 32]} style={{ marginBottom: '40px' }}>
            {/* Company Info */}
            <Col xs={24} sm={12} md={6}>
              <Title level={4} style={{ color: '#fff', marginBottom: '16px' }}>
                SAP Business
              </Title>
              <Paragraph style={{ color: '#8c8c8c', marginBottom: '16px' }}>
                Professional business management software for enterprises worldwide. Secure, reliable, and easy to use.
              </Paragraph>
              <Space direction="vertical" size="small">
                <a href="tel:+256706564628" style={{ color: '#8c8c8c', textDecoration: 'none', display: 'block' }}>
                  <PhoneOutlined /> +256 706 564 628
                </a>
                <a href="mailto:saptechnologies256@gmail.com" style={{ color: '#8c8c8c', textDecoration: 'none', display: 'block' }}>
                  <MailOutlined /> saptechnologies256@gmail.com
                </a>
              </Space>
            </Col>

            {/* Quick Links */}
            <Col xs={24} sm={12} md={6}>
              <Title level={4} style={{ color: '#fff', marginBottom: '16px' }}>
                Quick Links
              </Title>
              <Space direction="vertical" size="small" style={{ width: '100%' }}>
                <a onClick={() => navigate('/company-register')} style={{ color: '#8c8c8c', textDecoration: 'none', cursor: 'pointer', display: 'block' }}>
                  Register Your Company / Business
                </a>
                <a onClick={() => navigate('/login')} style={{ color: '#8c8c8c', textDecoration: 'none', cursor: 'pointer', display: 'block' }}>
                  Login to Account
                </a>
                <a href="#features" style={{ color: '#8c8c8c', textDecoration: 'none', display: 'block' }}>
                  Features
                </a>
                <a href="#how-it-works" style={{ color: '#8c8c8c', textDecoration: 'none', display: 'block' }}>
                  How It Works
                </a>
                <a href="#faq" style={{ color: '#8c8c8c', textDecoration: 'none', display: 'block' }}>
                  FAQ
                </a>
              </Space>
            </Col>

            {/* Support */}
            <Col xs={24} sm={12} md={6}>
              <Title level={4} style={{ color: '#fff', marginBottom: '16px' }}>
                Support
              </Title>
              <Space direction="vertical" size="small" style={{ width: '100%' }}>
                <a href="https://wa.me/256706564628" target="_blank" rel="noopener noreferrer" style={{ color: '#8c8c8c', textDecoration: 'none', display: 'block' }}>
                  <WhatsAppOutlined /> WhatsApp Support
                </a>
                <a href="mailto:saptechnologies256@gmail.com" style={{ color: '#8c8c8c', textDecoration: 'none', display: 'block' }}>
                  Email Support
                </a>
                <a href="tel:+256706564628" style={{ color: '#8c8c8c', textDecoration: 'none', display: 'block' }}>
                  Phone Support
                </a>
                <a href="#faq" style={{ color: '#8c8c8c', textDecoration: 'none', display: 'block' }}>
                  Help Center
                </a>
                <a href="#" style={{ color: '#8c8c8c', textDecoration: 'none', display: 'block' }}>
                  Documentation
                </a>
              </Space>
            </Col>

            {/* Legal */}
            <Col xs={24} sm={12} md={6}>
              <Title level={4} style={{ color: '#fff', marginBottom: '16px' }}>
                Legal
              </Title>
              <Space direction="vertical" size="small" style={{ width: '100%' }}>
                <a onClick={() => navigate('/privacy-policy')} style={{ color: '#8c8c8c', textDecoration: 'none', display: 'block', cursor: 'pointer' }}>
                  Privacy Policy
                </a>
                <a onClick={() => navigate('/terms-conditions')} style={{ color: '#8c8c8c', textDecoration: 'none', display: 'block', cursor: 'pointer' }}>
                  Terms & Conditions
                </a>
                <a onClick={() => navigate('/cookie-policy')} style={{ color: '#8c8c8c', textDecoration: 'none', display: 'block', cursor: 'pointer' }}>
                  Cookie Policy
                </a>
                <a onClick={() => navigate('/refund-policy')} style={{ color: '#8c8c8c', textDecoration: 'none', display: 'block', cursor: 'pointer' }}>
                  Refund Policy
                </a>
                <a onClick={() => navigate('/data-protection')} style={{ color: '#8c8c8c', textDecoration: 'none', display: 'block', cursor: 'pointer' }}>
                  Data Protection
                </a>
                <a onClick={() => navigate('/acceptable-use')} style={{ color: '#8c8c8c', textDecoration: 'none', display: 'block', cursor: 'pointer' }}>
                  Acceptable Use Policy
                </a>
              </Space>
            </Col>
          </Row>

          {/* Bottom Footer */}
          <div style={{ 
            borderTop: '1px solid #303030', 
            paddingTop: '24px',
            textAlign: 'center'
          }}>
            <Row gutter={[16, 16]} justify="center" align="middle">
              <Col xs={24} md={12} style={{ textAlign: 'center', order: 2 }}>
                <Paragraph style={{ margin: 0, color: '#8c8c8c', fontSize: '14px' }}>
                  ┬⌐ 2026 SAP Business Management Software. All rights reserved.
                </Paragraph>
              </Col>
              <Col xs={24} md={12} style={{ textAlign: 'center', order: 1 }}>
                <Paragraph style={{ margin: 0, color: '#8c8c8c', fontSize: '14px' }}>
                  Designed and powered by{' '}
                  <a 
                    href="https://www.sap-technologies.com" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    style={{ color: '#1890ff', fontWeight: '600', textDecoration: 'none' }}
                  >
                    SAP Technologies Uganda
                  </a>
                </Paragraph>
              </Col>
            </Row>
            
            {/* Legal Links */}
            <div style={{ marginTop: '16px' }}>
              <Space size="middle" wrap style={{ justifyContent: 'center' }}>
                <a onClick={() => navigate('/privacy-policy')} style={{ color: '#8c8c8c', fontSize: '12px', textDecoration: 'none', cursor: 'pointer' }}>
                  Privacy
                </a>
                <span style={{ color: '#303030' }}>|</span>
                <a onClick={() => navigate('/terms-conditions')} style={{ color: '#8c8c8c', fontSize: '12px', textDecoration: 'none', cursor: 'pointer' }}>
                  Terms
                </a>
                <span style={{ color: '#303030' }}>|</span>
                <a onClick={() => navigate('/cookie-policy')} style={{ color: '#8c8c8c', fontSize: '12px', textDecoration: 'none', cursor: 'pointer' }}>
                  Cookies
                </a>
                <span style={{ color: '#303030' }}>|</span>
                <a onClick={() => navigate('/data-protection')} style={{ color: '#8c8c8c', fontSize: '12px', textDecoration: 'none', cursor: 'pointer' }}>
                  Data Protection
                </a>
                <span style={{ color: '#303030' }}>|</span>
                <a onClick={() => navigate('/')} style={{ color: '#8c8c8c', fontSize: '12px', textDecoration: 'none', cursor: 'pointer' }}>
                  Sitemap
                </a>
              </Space>
            </div>

            {/* Compliance & Security Badges */}
            <div style={{ marginTop: '20px' }}>
              <Space size="large" wrap style={{ justifyContent: 'center' }}>
                <span style={{ 
                  padding: '4px 12px', 
                  backgroundColor: '#1f1f1f', 
                  borderRadius: '4px',
                  fontSize: '12px',
                  color: '#52c41a'
                }}>
                  <SafetyOutlined /> Secure Platform
                </span>
                <span style={{ 
                  padding: '4px 12px', 
                  backgroundColor: '#1f1f1f', 
                  borderRadius: '4px',
                  fontSize: '12px',
                  color: '#1890ff'
                }}>
                  <DatabaseOutlined /> Data Protected
                </span>
                <span style={{ 
                  padding: '4px 12px', 
                  backgroundColor: '#1f1f1f', 
                  borderRadius: '4px',
                  fontSize: '12px',
                  color: '#faad14'
                }}>
                  <CloudServerOutlined /> Cloud Backup
                </span>
              </Space>
            </div>
          </div>
        </div>
      </div>
      <BackToTop />
      <SAPAIChatbot position="welcome" />
    </div>
  )
}

export default Welcome
