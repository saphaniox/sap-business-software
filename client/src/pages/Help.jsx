import React, { useState } from 'react'
import { Card, Collapse, Typography, Input, Tag, Space, Divider, Row, Col, Button, Alert } from 'antd'
import {
  SearchOutlined,
  QuestionCircleOutlined,
  ShoppingCartOutlined,
  UserOutlined,
  BarChartOutlined,
  FileTextOutlined,
  SettingOutlined,
  DollarOutlined,
  SafetyOutlined,
  RocketOutlined,
  TeamOutlined,
  ShoppingOutlined,
  PrinterOutlined,
  DownloadOutlined,
  BookOutlined,
  DatabaseOutlined
} from '@ant-design/icons'
import { useAuthStore } from '../store/authStore'
import BackToTop from '../components/BackToTop'

const { Title, Paragraph, Text } = Typography
const { Panel } = Collapse
const { Search } = Input

function Help() {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeKeys, setActiveKeys] = useState([])
  const { user } = useAuthStore()
  
  // Get user role, default to 'staff' if not available
  const userRole = user?.role?.toLowerCase() || 'staff'

  const helpSections = [
    {
      key: 'superadmin-guide',
      title: 'Super Admin Guide',
      icon: <SafetyOutlined />,
      tag: 'Admin',
      tagColor: 'red',
      roles: ['superadmin'],
      items: [
        {
          question: '👑 What is my role as Super Admin?',
          answer: (
            <>
              <Paragraph>
                Welcome to the control center! 🎛️ As a Super Admin, you\'re the guardian of our entire platform. 
                Think of yourself as the platform manager who ensures everything runs smoothly for all businesses. Here\'s what you can do:
              </Paragraph>
              <Paragraph>
                <strong>Company Management:</strong><br />
                • Approve or reject new business registrations<br />
                • Monitor all registered companies<br />
                • Block, suspend, or ban companies if needed<br />
                • Reactivate suspended/blocked companies<br />
                <br />
                <strong>User Oversight:</strong><br />
                • View all users across all companies<br />
                • Monitor user activities and access<br />
                • Ensure system security and compliance<br />
                <br />
                <strong>System Administration:</strong><br />
                • Access help documentation<br />
                • Monitor system health<br />
                • Manage platform-wide settings
              </Paragraph>
              <Alert 
                message="Important" 
                description="You do NOT manage individual business operations (products, sales, invoices, etc.). Each company manages their own business data independently." 
                type="warning" 
                showIcon 
              />
            </>
          )
        },
        {
          question: '✅ How do I approve new business registrations?',
          answer: (
            <Paragraph>
              <strong>It\'s as easy as 1-2-3! Here\'s how:</strong><br />
              1. 📋 Head over to <strong>Company Approvals</strong> from your dashboard<br />
              2. 👀 Browse through businesses waiting with <Tag color="orange">Pending Approval</Tag> status<br />
              3. 🔍 Click <strong>View Details</strong> to check out their information<br />
              4. 🤔 Take a moment to review everything<br />
              5. 👍 Click <strong>Approve</strong> to welcome them aboard!<br />
              6. 👎 Or click <strong>Reject</strong> if something doesn\'t look right (don\'t forget to explain why)<br />
              7. 🎉 Once approved, they can jump right in and start using the system!<br />
              <br />
              <Alert message="Tip" description="Check pending approvals count on your dashboard for quick access." type="info" showIcon />
            </Paragraph>
          )
        },
        {
          question: 'How do I manage and control companies?',
          answer: (
            <Paragraph>
              Go to <strong>Manage Companies</strong> to access company management tools:<br />
              <br />
              <strong>Available Actions:</strong><br />
              • <Tag color="orange">Suspend</Tag> - Temporarily disable company access (reversible)<br />
              • <Tag color="red">Block</Tag> - Prevent company login (reversible)<br />
              • <Tag color="volcano">Ban</Tag> - Permanently ban a company (severe action)<br />
              • <Tag color="green">Reactivate</Tag> - Restore access to suspended/blocked companies<br />
              <br />
              <strong>When to use each action:</strong><br />
              • Suspend: Payment issues, policy violations<br />
              • Block: Security concerns, investigation needed<br />
              • Ban: Serious violations, fraud, abuse<br />
              • Reactivate: Issues resolved, penalties served
            </Paragraph>
          )
        },
        {
          question: 'How do I view all users in the system?',
          answer: (
            <Paragraph>
              Click <strong>All Users</strong> from your dashboard to see:<br />
              • Complete list of all users across all companies<br />
              • User roles (Admin, Manager, Sales)<br />
              • Company associations<br />
              • Account status and creation dates<br />
              • Search and filter capabilities<br />
              <br />
              <Alert message="Note" description="You can view users but cannot modify them. Each company admin manages their own users." type="info" showIcon />
            </Paragraph>
          )
        },
        {
          question: 'What should I do if I need support?',
          answer: (
            <Paragraph>
              <strong>Contact Information:</strong><br />
              📧 Email: saptechnologies256@gmail.com<br />
              📱 Phone/WhatsApp: +256 706 564 628<br />
              <br />
              For technical issues, system errors, or questions about your super admin role, reach out using the contacts above.
            </Paragraph>
          )
        }
      ]
    },
    {
      key: 'ai-assistant',
      title: 'SAP Business AI Assistant',
      icon: <QuestionCircleOutlined />,
      tag: 'NEW',
      tagColor: 'purple',
      roles: ['admin', 'manager', 'staff'],
      items: [
        {
          question: '🤖 What is the SAP Business AI Assistant?',
          answer: (
            <>
              <Paragraph>
                The <strong>SAP Business AI Assistant</strong> is your intelligent helper available 24/7 to answer questions about the SAP Business Management System. Think of it as your personal guide!
              </Paragraph>
              <Paragraph>
                <strong>Where to find it:</strong><br />
                • Look for the floating <Tag color="blue">? AI</Tag> button on the bottom-right corner<br />
                • Available on Welcome, Login, Register, and Company Register pages<br />
                • Click the button to open the chat interface<br />
                <br />
                <strong>What it can help you with:</strong><br />
                ✅ System features and capabilities<br />
                ✅ How to register and get started<br />
                ✅ Privacy policies and terms of service<br />
                ✅ Pricing information<br />
                ✅ Mobile app availability<br />
                ✅ Technical support contacts<br />
                ✅ Frequently asked questions<br />
                <br />
                <strong>What it CANNOT do:</strong><br />
                ❌ Access other users' business data<br />
                ❌ Answer questions about external businesses<br />
                ❌ Provide information outside the SAP system<br />
              </Paragraph>
              <Alert 
                message="Privacy Protected" 
                description="The AI Assistant only provides information about the SAP system. It respects data privacy and will not answer questions about other businesses." 
                type="success" 
                showIcon 
              />
            </>
          )
        },
        {
          question: 'How do I use the AI Assistant?',
          answer: (
            <Paragraph>
              <strong>Simple steps:</strong><br />
              1. Click the <Tag color="blue">? AI</Tag> floating button (bottom-right)<br />
              2. Type your question in the chat box<br />
              3. Press Enter or click Send<br />
              4. Get instant answers with helpful suggestions<br />
              5. Click on suggestions for follow-up questions<br />
              <br />
              <strong>Example questions:</strong><br />
              • "What is SAP Business Management System?"<br />
              • "How do I register?"<br />
              • "Tell me about pricing"<br />
              • "Is there a mobile app?"<br />
              • "What are the privacy policies?"<br />
              <br />
              The AI understands natural language, so ask questions naturally!
            </Paragraph>
          )
        }
      ]
    },
    {
      key: 'getting-started',
      title: 'Getting Started',
      icon: <RocketOutlined />,
      tag: 'Basics',
      tagColor: 'blue',
      roles: ['admin', 'manager', 'staff'], // Available to all roles
      items: [
        {
          question: 'How do I register my business?',
          answer: (
            <>
              <Paragraph>
                <strong>For New Companies / Businesses:</strong><br />
                1. Visit the welcome page<br />
                2. Click <strong>"Register Your Company / Business"</strong><br />
                3. Select your business type from 16 available options:<br />
                &nbsp;&nbsp;&nbsp;• Retail & Wholesale<br />
                &nbsp;&nbsp;&nbsp;• Restaurant & Hospitality<br />
                &nbsp;&nbsp;&nbsp;• Supermarket & Grocery<br />
                &nbsp;&nbsp;&nbsp;• Pharmacy & Healthcare<br />
                &nbsp;&nbsp;&nbsp;• Electronics & Technology<br />
                &nbsp;&nbsp;&nbsp;• Fashion & Apparel<br />
                &nbsp;&nbsp;&nbsp;• Hardware & Construction<br />
                &nbsp;&nbsp;&nbsp;• Automotive & Parts<br />
                &nbsp;&nbsp;&nbsp;• Beauty & Cosmetics<br />
                &nbsp;&nbsp;&nbsp;• Bookstore & Stationery<br />
                &nbsp;&nbsp;&nbsp;• Agriculture & Farming<br />
                &nbsp;&nbsp;&nbsp;• Furniture & Home Décor<br />
                &nbsp;&nbsp;&nbsp;• Sports & Fitness<br />
                &nbsp;&nbsp;&nbsp;• Printing & Publishing<br />
                &nbsp;&nbsp;&nbsp;• Pet Shop & Supplies<br />
                &nbsp;&nbsp;&nbsp;• General Merchandise<br />
                4. Fill in your business information<br />
                5. Create your admin account<br />
                6. Your business data is completely isolated and secure
              </Paragraph>
              <Alert 
                message="Complete Data Isolation" 
                description="Each business gets its own database. Your data cannot be accessed by other businesses." 
                type="success" 
                showIcon 
              />
            </>
          )
        },
        {
          question: 'How do I log in to the system?',
          answer: (
            <>
              <Paragraph>
                1. Navigate to the login page<br />
                2. (Optional) Enter your business name for faster login<br />
                3. Enter your username<br />
                4. Enter your password<br />
                5. Click the "Login" button
              </Paragraph>
              <Alert message="First Time User?" description="Contact your business administrator to create an account for you." type="info" showIcon />
            </>
          )
        },
        {
          question: 'How do I navigate the dashboard?',
          answer: (
            <Paragraph>
              The dashboard is your home screen showing:<br />
              • <strong>Key Performance Indicators (KPIs)</strong> - Total sales, orders, and averages<br />
              • <strong>Today's Performance</strong> - Daily revenue, profit, expenses, and net profit<br />
              • <strong>Sales Trend Analysis</strong> - Visual charts of your sales over time<br />
              • <strong>Low Stock Alerts</strong> - Products that need reordering<br />
              <br />
              Use the sidebar menu to access different sections like Products, Sales, Customers, etc.
            </Paragraph>
          )
        },
        {
          question: 'What are the different user roles?',
          answer: (
            <>
              <Paragraph>
                <strong>Important:</strong> User permissions are <Text strong style={{ color: '#1890ff' }}>controlled by Admin users</Text>, not by default system settings.
              </Paragraph>
              <Paragraph>
                <strong>Available Roles:</strong><br />
                • <Tag color="red">Admin</Tag> - Full control over the system. Admins assign permissions to other users and decide what each user can do.<br />
                • <Tag color="blue">Manager</Tag> - Typically given access to products, customers, sales, and reports. <Text type="secondary">(Admin decides specific permissions)</Text><br />
                • <Tag color="green">Sales</Tag> - Usually can create sales orders and invoices. <Text type="secondary">(Admin decides what they can access)</Text><br />
                <br />
                <Text type="secondary">Your Admin controls which features you can access. Contact your business administrator to request additional permissions.</Text>
              </Paragraph>
              <Alert
                message="Who Controls Permissions?"
                description="Admin users have complete control over user permissions. They can grant or revoke access to add, edit, delete features for each user individually using the 'Manage Permissions' button on the Users page."
                type="info"
                showIcon
              />
            </>
          )
        },
        {
          question: 'How do I navigate quickly on long pages?',
          answer: (
            <Paragraph>
              When scrolling down on any page, a <strong>Back to Top</strong> button automatically appears in the bottom-right corner.<br />
              <br />
              <strong>To use it:</strong><br />
              1. Scroll down more than 300 pixels<br />
              2. Click the floating arrow button<br />
              3. The page smoothly scrolls back to the top<br />
              <br />
              <Text type="secondary">This feature is available on all pages including Dashboard, Products, Sales, and more.</Text>
            </Paragraph>
          )
        }
      ]
    },
    {
      key: 'products',
      title: 'Product Management',
      icon: <ShoppingOutlined />,
      tag: 'Products',
      tagColor: 'green',
      roles: ['admin', 'manager', 'staff'],
      items: [
        {
          question: 'How do I add a new product?',
          answer: (
            <Paragraph>
              1. Go to <strong>Products</strong> from the sidebar<br />
              2. Click the <strong>"Add Product"</strong> button<br />
              3. Fill in the product details:<br />
              &nbsp;&nbsp;&nbsp;• Product Name<br />
              &nbsp;&nbsp;&nbsp;• Category<br />
              &nbsp;&nbsp;&nbsp;• Cost Price (what you paid)<br />
              &nbsp;&nbsp;&nbsp;• Selling Price (what customers pay)<br />
              &nbsp;&nbsp;&nbsp;• Stock Quantity<br />
              &nbsp;&nbsp;&nbsp;• Minimum Stock Level (for alerts)<br />
              4. Click <strong>"Add Product"</strong> to save
            </Paragraph>
          )
        },
        {
          question: 'How do I edit or delete a product?',
          answer: (
            <Paragraph>
              <strong>To Edit:</strong><br />
              1. Find the product in the products table<br />
              2. Click the <strong>Edit</strong> icon in the Actions column<br />
              3. Update the information<br />
              4. Click <strong>"Update Product"</strong><br />
              <br />
              <strong>To Delete:</strong><br />
              1. Click the <strong>Delete</strong> icon in the Actions column<br />
              2. Confirm the deletion<br />
              <br />
              <Alert message="Warning" description="Deleting a product cannot be undone. Make sure you really want to remove it." type="warning" showIcon />
            </Paragraph>
          )
        },
        {
          question: 'How do I search for products?',
          answer: (
            <Paragraph>
              Use the search bar at the top of the Products page to search by:<br />
              • Product name<br />
              • Category<br />
              • SKU/Code<br />
              <br />
              The search updates in real-time as you type. You can also use the advanced search drawer for more filters.
            </Paragraph>
          )
        },
        {
          question: '📱 How do I use barcode scanning?',
          answer: (
            <div>
              <Paragraph>
                <strong>Quick and easy barcode scanning built right in!</strong>
              </Paragraph>
              <Paragraph>
                1. On the Products page, click the <strong>"Scan Barcode"</strong> button<br />
                2. Allow camera access when prompted by your browser<br />
                3. Point your device camera at the barcode or QR code<br />
                4. The system automatically detects and searches for matching products<br />
                5. If found, the product details appear instantly<br />
                <br />
                <strong>Supported Formats:</strong><br />
                ✓ QR Codes<br />
                ✓ EAN-13 & EAN-8 (European Article Number)<br />
                ✓ UPC-A & UPC-E (Universal Product Code)<br />
                ✓ Code 128 (High-density barcode)<br />
                ✓ Code 39 (Alphanumeric barcode)<br />
                <br />
                <Alert message="Pro Tip" description="Add barcode numbers as SKU/Code when creating products, then scan them for lightning-fast product lookup!" type="success" showIcon />
              </Paragraph>
            </div>
          )
        },
        {
          question: 'What are low stock alerts?',
          answer: (
            <Paragraph>
              When a product's quantity falls below its minimum stock level, it appears in:<br />
              • The <strong>Low Stock Items</strong> card on the dashboard<br />
              • A warning alert banner<br />
              • Highlighted in red in the products table<br />
              <br />
              This helps you reorder products before running out of stock.
            </Paragraph>
          )
        }
      ]
    },
    {
      key: 'productivity',
      title: 'Productivity Features',
      icon: <RocketOutlined />,
      tag: 'Tips',
      tagColor: 'purple',
      roles: ['admin', 'manager', 'staff'],
      items: [
        {
          question: '⚡ What keyboard shortcuts are available?',
          answer: (
            <div>
              <Paragraph>
                <strong>Work faster with these time-saving shortcuts:</strong>
              </Paragraph>
              <Paragraph>
                <Tag color="blue">Ctrl+S</Tag> - Save forms and changes instantly<br />
                <Tag color="blue">Esc</Tag> - Cancel or close modals and dialogs<br />
                <Tag color="blue">Enter</Tag> - Submit forms when focused on input fields<br />
                <br />
                These shortcuts work across all pages - Products, Sales, Customers, Invoices, and more!
              </Paragraph>
            </div>
          )
        },
        {
          question: '💾 How does auto-save work?',
          answer: (
            <Paragraph>
              Forms automatically save drafts to your browser's local storage as you type. If you accidentally close a form 
              or your browser crashes, don't worry! When you reopen the form, you'll see a <strong>"Load Draft"</strong> button 
              to recover your unsaved work.<br />
              <br />
              <Alert message="Never Lose Data" description="Auto-save keeps your work safe even if you navigate away or experience unexpected issues. Just click 'Load Draft' to continue where you left off!" type="info" showIcon />
            </Paragraph>
          )
        },
        {
          question: '🔄 How does real-time sync work?',
          answer: (
            <Paragraph>
              All changes sync instantly across all users in your business. When any team member:<br />
              • Adds or updates a product<br />
              • Creates a sale<br />
              • Updates inventory<br />
              • Makes any other change<br />
              <br />
              Everyone sees the update immediately without refreshing. This ensures your entire team works with accurate, 
              up-to-date information at all times. Perfect for multi-user environments and multiple locations!
            </Paragraph>
          )
        },
        {
          question: '📈 What is demand forecasting?',
          answer: (
            <div>
              <Paragraph>
                <strong>Smart analytics that predict what you'll sell!</strong>
              </Paragraph>
              <Paragraph>
                Our system analyzes your sales history to forecast future demand. Access it from the Dashboard or Analytics pages to see:<br />
                • Trending products and bestsellers<br />
                • Seasonal sales patterns<br />
                • Product demand velocity<br />
                • Stock reorder recommendations<br />
                • Sales predictions for planning<br />
                <br />
                Use these insights to optimize inventory, avoid stockouts, plan promotions, and make smarter purchasing decisions!
              </Paragraph>
            </div>
          )
        },
        {
          question: '🔍 How do I use advanced search and filtering?',
          answer: (
            <Paragraph>
              Every major page (Products, Sales, Customers, Invoices) includes powerful filtering:<br />
              • <strong>Quick Search:</strong> Type in the search bar for instant results<br />
              • <strong>Date Ranges:</strong> Filter by specific dates or periods<br />
              • <strong>Categories:</strong> Filter by product categories<br />
              • <strong>Status:</strong> Filter by payment status, stock status, etc.<br />
              • <strong>Amount Ranges:</strong> Filter by price or total amount<br />
              • <strong>Multi-Criteria:</strong> Combine multiple filters for precise results<br />
              <br />
              Look for the search icon or filter buttons at the top of each page!
            </Paragraph>
          )
        }
      ]
    },
    {
      key: 'sales',
      title: 'Sales & Orders',
      icon: <ShoppingCartOutlined />,
      tag: 'Sales',
      tagColor: 'orange',
      roles: ['admin', 'manager', 'staff'],
      items: [
        {
          question: 'How do I create a new sale?',
          answer: (
            <>
              <Paragraph>
                1. Go to <strong>Sales</strong> from the sidebar<br />
                2. Click <strong>"New Sale"</strong><br />
                3. <Text strong style={{ color: '#52c41a' }}>(Optional)</Text> Enter customer name and phone<br />
                4. Add items to the order:<br />
                &nbsp;&nbsp;&nbsp;• Search for the product<br />
                &nbsp;&nbsp;&nbsp;• Enter quantity<br />
                &nbsp;&nbsp;&nbsp;• Price auto-fills but can be adjusted<br />
                5. Choose payment method (Cash/Card/Mobile Money)<br />
                6. Select currency (UGX/USD)<br />
                7. Add notes if needed<br />
                8. Click <strong>"Create Sale"</strong>
              </Paragraph>
              <Alert 
                message="✨ NEW: Optional Customer Fields" 
                description="Customer name and phone are now optional! Create quick sales without customer details. When you do provide both name and phone, the customer is automatically registered in your database." 
                type="success" 
                showIcon 
              />
            </>
          )
        },
        {
          question: '🆕 How does auto-customer registration work?',
          answer: (
            <Paragraph>
              <strong>New Feature:</strong> The system now automatically creates customer records!<br />
              <br />
              <strong>How it works:</strong><br />
              1. When creating a sale or invoice, enter customer name AND phone<br />
              2. System checks if customer exists (by phone number)<br />
              3. If customer doesn't exist → Automatically creates new customer<br />
              4. If customer exists → Uses existing record<br />
              5. No duplicates are created (phone number is unique)<br />
              <br />
              <strong>Benefits:</strong><br />
              ✅ No need to manually create customers first<br />
              ✅ Build your customer database automatically<br />
              ✅ Duplicate prevention by phone number<br />
              ✅ Faster workflow - create sales quickly<br />
              ✅ Customer details optional for anonymous sales<br />
              <br />
              <Alert 
                message="Pro Tip" 
                description="For walk-in customers you don't know, simply skip the customer fields. For regular customers, add their name and phone once - they'll be saved automatically!" 
                type="info" 
                showIcon 
              />
            </Paragraph>
          )
        },
        {
          question: '📥 How do I download individual sales orders?',
          answer: (
            <Paragraph>
              <strong>New Feature:</strong> Download each sales order separately as a professional PDF!<br />
              <br />
              <strong>Steps:</strong><br />
              1. Go to <strong>Sales</strong> page<br />
              2. Find the sales order you want to download<br />
              3. Click the <DownloadOutlined /> <strong>Download</strong> button<br />
              4. PDF file downloads automatically with:<br />
              &nbsp;&nbsp;&nbsp;• Your company branding (name, logo, contact)<br />
              &nbsp;&nbsp;&nbsp;• Sales order details (ID, date, status)<br />
              &nbsp;&nbsp;&nbsp;• Customer information (if provided)<br />
              &nbsp;&nbsp;&nbsp;• Complete items list with prices<br />
              &nbsp;&nbsp;&nbsp;• Grand total with currency<br />
              <br />
              <strong>Perfect for:</strong><br />
              • Sharing with customers<br />
              • Keeping records<br />
              • Email attachments<br />
              • Accounting purposes<br />
            </Paragraph>
          )
        },
        {
          question: 'How do I view or edit a sale?',
          answer: (
            <Paragraph>
              <strong>To View:</strong><br />
              Click on any sale in the sales table to view full details including:<br />
              • Customer information<br />
              • Items ordered<br />
              • Prices and totals<br />
              • Payment method<br />
              • Sale date and status<br />
              <br />
              <strong>To Edit:</strong><br />
              Click the <strong>Edit</strong> icon to modify sale details. You can update quantities, prices, or payment information.
            </Paragraph>
          )
        },
        {
          question: 'How do I change the number of sales displayed per page?',
          answer: (
            <Paragraph>
              At the bottom of the sales table, you'll see pagination controls:<br />
              • Use the dropdown to select: <Tag>10</Tag> <Tag>20</Tag> <Tag>50</Tag> or <Tag>100</Tag> items per page<br />
              • Default is 50 items per page<br />
              • Use the arrow buttons to navigate between pages
            </Paragraph>
          )
        },
        {
          question: 'How do I print or export sales data?',
          answer: (
            <Paragraph>
              <strong>Print Sales List:</strong><br />
              Click the <PrinterOutlined /> <strong>Print</strong> button to print the current sales table.<br />
              <br />
              <strong>Export to CSV:</strong><br />
              Click the <DownloadOutlined /> <strong>Export CSV</strong> button to download all sales data as a spreadsheet.
            </Paragraph>
          )
        }
      ]
    },
    {
      key: 'customers',
      title: 'Customer Management',
      icon: <TeamOutlined />,
      tag: 'Customers',
      tagColor: 'purple',
      roles: ['admin', 'manager', 'staff'],
      items: [
        {
          question: 'How do I add a new customer?',
          answer: (
            <Paragraph>
              1. Go to <strong>Customers</strong> from the sidebar<br />
              2. Click <strong>"Add Customer"</strong><br />
              3. Enter customer details:<br />
              &nbsp;&nbsp;&nbsp;• Full Name (required)<br />
              &nbsp;&nbsp;&nbsp;• Email<br />
              &nbsp;&nbsp;&nbsp;• Phone Number<br />
              &nbsp;&nbsp;&nbsp;• Address<br />
              4. Click <strong>"Add Customer"</strong> to save<br />
              <br />
              <Alert message="Quick Tip" description="You can also create customers directly when making a sale." type="info" showIcon />
            </Paragraph>
          )
        },
        {
          question: 'How do I view customer purchase history?',
          answer: (
            <Paragraph>
              1. Find the customer in the customers table<br />
              2. Click the <strong>View</strong> icon<br />
              3. The customer details page shows:<br />
              &nbsp;&nbsp;&nbsp;• Contact information<br />
              &nbsp;&nbsp;&nbsp;• Total purchases<br />
              &nbsp;&nbsp;&nbsp;• Complete purchase history<br />
              &nbsp;&nbsp;&nbsp;• Last purchase date
            </Paragraph>
          )
        },
        {
          question: 'How do I export customer data?',
          answer: (
            <Paragraph>
              Click the <DownloadOutlined /> <strong>Export CSV</strong> button on the Customers page to download all customer data including their contact information and purchase statistics.
            </Paragraph>
          )
        }
      ]
    },
    {
      key: 'expenses',
      title: 'Expenses Tracking',
      icon: <DollarOutlined />,
      tag: 'Finance',
      tagColor: 'red',
      roles: ['admin', 'manager'],
      items: [
        {
          question: 'How do I record daily expenses?',
          answer: (
            <Paragraph>
              1. Go to <strong>Expenses</strong> from the sidebar<br />
              2. Click <strong>"Add Expense"</strong><br />
              3. Fill in the expense details:<br />
              &nbsp;&nbsp;&nbsp;• Amount (in UGX)<br />
              &nbsp;&nbsp;&nbsp;• Description (e.g., "Breakfast for staff")<br />
              &nbsp;&nbsp;&nbsp;• Category (e.g., "Meals", "Transport", "Utilities")<br />
              &nbsp;&nbsp;&nbsp;• Date<br />
              4. Click <strong>"Add Expense"</strong><br />
              <br />
              The expense is automatically subtracted from your profit calculations.
            </Paragraph>
          )
        },
        {
          question: 'How do expenses affect my profits?',
          answer: (
            <Paragraph>
              The system calculates two types of profit:<br />
              <br />
              <strong>Gross Profit</strong> = Revenue - Cost of Goods<br />
              <Text type="secondary">This is profit before expenses</Text><br />
              <br />
              <strong>Net Profit</strong> = Gross Profit - Total Expenses<br />
              <Text type="secondary">This is your actual profit after all costs</Text><br />
              <br />
              You can see both values in:<br />
              • Today's Performance on the dashboard<br />
              • Analytics page for different time periods<br />
              • Expense summary statistics
            </Paragraph>
          )
        },
        {
          question: 'How do I view expense summaries?',
          answer: (
            <Paragraph>
              The Expenses page shows:<br />
              • <strong>Total Expenses</strong> - Sum of all recorded expenses<br />
              • <strong>Total Records</strong> - Number of expense entries<br />
              • <strong>Average Expense</strong> - Mean expense per entry<br />
              <br />
              You can filter expenses by date range and see how they impact your daily net profit on the dashboard.
            </Paragraph>
          )
        }
      ]
    },
    {
      key: 'analytics',
      title: 'Analytics & Reports',
      icon: <BarChartOutlined />,
      tag: 'Reports',
      tagColor: 'cyan',
      roles: ['admin', 'manager'],
      items: [
        {
          question: 'What analytics are available?',
          answer: (
            <Paragraph>
              The system provides several analytics views:<br />
              <br />
              <strong>Dashboard Analytics:</strong><br />
              • Total sales and revenue<br />
              • Average order value<br />
              • Today's performance (revenue, profit, expenses)<br />
              • Sales trend charts (7-day or 30-day)<br />
              <br />
              <strong>Analytics Page:</strong><br />
              • Profit analytics by period (daily, weekly, monthly)<br />
              • Revenue breakdown by currency<br />
              • Expense tracking and ratios<br />
              • Product demand analysis<br />
              • Customer purchase patterns
            </Paragraph>
          )
        },
        {
          question: 'How do I read the profit analytics?',
          answer: (
            <Paragraph>
              On the Analytics page, select a time period to see:<br />
              <br />
              <strong>Revenue Metrics:</strong><br />
              • Total Revenue<br />
              • Total Cost (what you paid for goods sold)<br />
              • Gross Profit (revenue minus cost)<br />
              • Overall Margin percentage<br />
              <br />
              <strong>Expense Metrics:</strong><br />
              • Total Expenses (operational costs)<br />
              • Net Profit (actual profit after expenses)<br />
              • Expense Ratio (expenses as % of revenue)<br />
              <br />
              Net profit is shown in <Tag color="green">green</Tag> if positive or <Tag color="red">red</Tag> if negative.
            </Paragraph>
          )
        },
        {
          question: 'What is product demand analysis?',
          answer: (
            <Paragraph>
              Product demand analysis shows which products are selling the most:<br />
              • Top selling products by quantity<br />
              • Revenue generated per product<br />
              • Trending items<br />
              <br />
              This helps you identify:<br />
              • What to stock more of<br />
              • Which products to promote<br />
              • Slow-moving inventory
            </Paragraph>
          )
        }
      ]
    },
    {
      key: 'invoices',
      title: 'Invoices',
      icon: <FileTextOutlined />,
      tag: 'Documents',
      tagColor: 'geekblue',
      items: [
        {
          question: 'How do I generate an invoice?',
          answer: (
            <>
              <Paragraph>
                <strong>Method 1: From Sales Order</strong><br />
                1. Go to <strong>Invoices</strong> from the sidebar<br />
                2. Click <strong>"Generate Invoice"</strong><br />
                3. Select mode: "From Sales Order"<br />
                4. Choose the sales order to invoice<br />
                5. Click <strong>"Generate"</strong><br />
                <br />
                <strong>Method 2: Direct Invoice Creation</strong><br />
                1. Click <strong>"Generate Invoice"</strong><br />
                2. Select mode: "Direct Invoice"<br />
                3. <Text strong style={{ color: '#52c41a' }}>(Optional)</Text> Enter customer name and phone<br />
                4. Add items with quantities and prices<br />
                5. Click <strong>"Generate"</strong><br />
              </Paragraph>
              <Alert 
                message="✨ NEW: Optional Customer Fields" 
                description="Customer details are now optional! Create invoices quickly without customer information. When you provide both name and phone, the customer is automatically saved to your database." 
                type="success" 
                showIcon 
              />
            </>
          )
        },
        {
          question: '📥 How do I download or print an invoice?',
          answer: (
            <Paragraph>
              <strong>Download Individual Invoice (NEW):</strong><br />
              1. Find the invoice in the invoices table<br />
              2. Click the <DownloadOutlined /> <strong>Download</strong> button<br />
              3. Professional PDF downloads instantly with:<br />
              &nbsp;&nbsp;&nbsp;• Company branding and logo<br />
              &nbsp;&nbsp;&nbsp;• Invoice number and date<br />
              &nbsp;&nbsp;&nbsp;• Customer details (if provided)<br />
              &nbsp;&nbsp;&nbsp;• Complete items list<br />
              &nbsp;&nbsp;&nbsp;• Totals with currency<br />
              <br />
              <strong>Print Invoice:</strong><br />
              Click the <PrinterOutlined /> <strong>Print</strong> button for a printer-friendly version.<br />
              <br />
              <strong>Benefits:</strong><br />
              ✅ Share with customers via email<br />
              ✅ Keep organized records<br />
              ✅ Professional branding<br />
              ✅ Ready for accounting<br />
            </Paragraph>
          )
        }
      ]
    },
    {
      key: 'backup',
      title: 'Data Backup & Security',
      icon: <DatabaseOutlined />,
      tag: 'Admin Only',
      tagColor: 'orange',
      roles: ['admin'],
      items: [
        {
          question: 'How do I backup my business data?',
          answer: (
            <Paragraph>
              <strong>Automatic Backups:</strong><br />
              The system automatically backs up your data regularly to ensure safety.<br />
              <br />
              <strong>Manual Backup (Admin only):</strong><br />
              1. Go to <strong>Backup & Restore</strong> from the sidebar<br />
              2. Click <strong>"Create Backup"</strong><br />
              3. Add a description (e.g., "Before month-end closing")<br />
              4. Click <strong>"Create"</strong><br />
              5. Your backup is created and stored securely<br />
              <br />
              <Alert 
                message="What's Included" 
                description="Backups include all products, customers, sales orders, invoices, returns, expenses, and user accounts." 
                type="info" 
                showIcon 
              />
            </Paragraph>
          )
        },
        {
          question: 'How do I restore from a backup?',
          answer: (
            <Paragraph>
              <strong>⚠️ Admin Only - Use with Caution</strong><br />
              <br />
              1. Go to <strong>Backup & Restore</strong><br />
              2. Find the backup you want to restore<br />
              3. Click <strong>"Restore"</strong><br />
              4. Confirm the restoration<br />
              <br />
              <Alert 
                message="Important Warning" 
                description="Restoring a backup will replace all current data with the backup data. This action cannot be undone. Always create a current backup before restoring an old one." 
                type="error" 
                showIcon 
              />
            </Paragraph>
          )
        },
        {
          question: 'Is my business data secure?',
          answer: (
            <Paragraph>
              <strong>Yes! Your data is protected with multiple security layers:</strong><br />
              <br />
              <strong>Data Isolation:</strong><br />
              • Each business has its own separate database<br />
              • No business can access another's data<br />
              • Complete privacy and security<br />
              <br />
              <strong>Access Control:</strong><br />
              • JWT token-based authentication<br />
              • Role-based permissions (Admin/Manager/Staff)<br />
              • Secure password hashing (bcrypt)<br />
              • Account lockout after failed login attempts<br />
              <br />
              <strong>Audit Trail:</strong><br />
              • All Super Admin actions are logged<br />
              • IP addresses and timestamps recorded<br />
              • Full accountability for system changes<br />
              <br />
              <strong>Backup & Recovery:</strong><br />
              • Regular automated backups<br />
              • Manual backup options<br />
              • Point-in-time recovery available
            </Paragraph>
          )
        },
        {
          question: 'Can I download my data?',
          answer: (
            <Paragraph>
              <strong>Yes! You can export data in multiple formats:</strong><br />
              <br />
              <strong>CSV Exports:</strong><br />
              • Products list<br />
              • Customers database<br />
              • Sales records<br />
              • Expenses report<br />
              • User accounts<br />
              <br />
              <strong>PDF Exports:</strong><br />
              • Individual invoices<br />
              • Sales receipts<br />
              • Custom reports<br />
              <br />
              <strong>Database Backups:</strong><br />
              • Complete system backup (JSON format)<br />
              • Includes all tables and relationships<br />
              • Can be restored at any time<br />
              <br />
              <Text type="secondary">All exports are available from their respective pages using the Export or Download buttons.</Text>
            </Paragraph>
          )
        }
      ]
    },
    {
      key: 'users',
      title: 'User Management',
      icon: <UserOutlined />,
      tag: 'Admin Only',
      tagColor: 'red',
      roles: ['admin'],
      items: [
        {
          question: 'How do I add a new user? (Admin only)',
          answer: (
            <>
              <Paragraph>
                <strong>Only business administrators can create user accounts for their business.</strong><br />
                <br />
                1. Go to <strong>Users</strong> from the sidebar (visible to admins only)<br />
                2. Click <strong>"Create New User"</strong> button<br />
                3. Enter user details:<br />
                &nbsp;&nbsp;&nbsp;• Username (for login)<br />
                &nbsp;&nbsp;&nbsp;• Email address<br />
                &nbsp;&nbsp;&nbsp;• Password (min 6 characters)<br />
                &nbsp;&nbsp;&nbsp;• Confirm Password<br />
                &nbsp;&nbsp;&nbsp;• Role (Admin/Manager/Sales)<br />
                4. Click <strong>"Create User"</strong><br />
                <br />
                The new user can immediately login with the credentials you provided.
              </Paragraph>
              <Alert 
                message="Admin-Only Feature" 
                description="Only administrators can see the Users menu and create accounts. Managers and Sales users cannot access user management." 
                type="warning" 
                showIcon 
              />
            </>
          )
        },
        {
          question: 'What are the different user roles?',
          answer: (
            <>
              <Alert
                message="Admin Users Control All Permissions"
                description="User permissions are NOT set by the system. Your Admin decides what each user can do by assigning roles and customizing permissions."
                type="warning"
                showIcon
                style={{ marginBottom: 16 }}
              />
              <Paragraph>
                <strong>Available Roles (Permissions customized by Admin):</strong><br />
                <br />
                • <Tag color="red" icon={<UserOutlined />}>ADMIN</Tag> - Typically granted full access:<br />
                &nbsp;&nbsp;&nbsp;→ Create and manage users with custom permissions<br />
                &nbsp;&nbsp;&nbsp;→ Assign or revoke permissions for other users<br />
                &nbsp;&nbsp;&nbsp;→ Full control over products, customers, sales, reports<br />
                &nbsp;&nbsp;&nbsp;→ Access to system backups and business settings<br />
                <br />
                • <Tag color="blue" icon={<UserOutlined />}>MANAGER</Tag> - Admin decides their permissions, often:<br />
                &nbsp;&nbsp;&nbsp;→ Add/edit products and customers<br />
                &nbsp;&nbsp;&nbsp;→ Create and manage sales orders<br />
                &nbsp;&nbsp;&nbsp;→ View reports and analytics<br />
                &nbsp;&nbsp;&nbsp;→ <Text type="secondary">Specific permissions (add, edit, delete) set by Admin</Text><br />
                <br />
                • <Tag color="green" icon={<UserOutlined />}>SALES</Tag> - Admin controls what they can access, usually:<br />
                &nbsp;&nbsp;&nbsp;→ Create sales orders and invoices<br />
                &nbsp;&nbsp;&nbsp;→ View products and customers (read-only)<br />
                &nbsp;&nbsp;&nbsp;→ <Text type="secondary">Cannot manage products/customers unless Admin grants permission</Text><br />
                <br />
                <Text strong>💡 Key Point:</Text> The Admin uses the "Manage Permissions" button on the Users page to grant or revoke specific permissions (add, edit, delete) for each feature.<br />
                <br />
                <Text type="secondary">Need different permissions? Contact your business Admin to request changes.</Text>
              </Paragraph>
            </>
          )
        },
        {
          question: 'How do I change a user\'s role?',
          answer: (
            <>
              <Paragraph>
                <strong>As an Admin, you control user roles and permissions:</strong><br />
                <br />
                1. Go to <strong>Users</strong> page<br />
                2. Find the user in the table<br />
                3. Click the role dropdown in the "Change Role" column<br />
                4. Select the new role:<br />
                &nbsp;&nbsp;&nbsp;• <Tag color="red">Admin</Tag> - Full system access<br />
                &nbsp;&nbsp;&nbsp;• <Tag color="blue">Manager</Tag> - Business operations access<br />
                &nbsp;&nbsp;&nbsp;• <Tag color="green">Sales</Tag> - Sales orders only<br />
                5. Click <strong>"Manage Permissions"</strong> button to customize what they can do:<br />
                &nbsp;&nbsp;&nbsp;→ Grant or revoke "Add" permissions<br />
                &nbsp;&nbsp;&nbsp;→ Grant or revoke "Edit" permissions<br />
                &nbsp;&nbsp;&nbsp;→ Grant or revoke "Delete" permissions<br />
                &nbsp;&nbsp;&nbsp;→ Control access to reports, user management, settings<br />
                6. Changes take effect immediately<br />
                <br />
                <Alert message="Admin Controls Permissions" description="YOU decide what each user can do. The system does not set default permissions - you have full control over add, edit, delete permissions for every feature." type="info" showIcon />
              </Paragraph>
            </>
          )
        },
        {
          question: 'How do I reset a user\'s password?',
          answer: (
            <Paragraph>
              <strong>As a business admin:</strong><br />
              1. Go to the <strong>Users</strong> page<br />
              2. Find the user in the table<br />
              3. Click the <strong>Password</strong> button in the Actions column<br />
              4. Enter a new password (min 6 characters)<br />
              5. Confirm the password<br />
              6. Click <strong>"Change Password"</strong><br />
              <br />
              <Alert message="Security" description="Inform the user of their new password through a secure channel. Encourage them to change it after first login." type="warning" showIcon />
            </Paragraph>
          )
        },
        {
          question: 'How do I delete a user account?',
          answer: (
            <Paragraph>
              1. Go to the <strong>Users</strong> page<br />
              2. Find the user you want to remove<br />
              3. Click the <strong>Delete</strong> button (red button)<br />
              4. Confirm the deletion in the popup<br />
              <br />
              <Alert 
                message="Important Restrictions" 
                description={
                  <>
                    • You cannot delete your own account<br />
                    • You cannot delete the last admin user<br />
                    • Deletion is permanent and cannot be undone<br />
                  </>
                }
                type="error" 
                showIcon 
              />
            </Paragraph>
          )
        },
        {
          question: 'How do I register my business and get started?',
          answer: (
            <>
              <Paragraph>
                <strong>Company/Business owners can self-register and create their account.</strong><br />
                <br />
                <strong>Registration Process:</strong><br />
                1. Click <strong>"Register Your Company / Business"</strong> on the welcome page<br />
                2. Fill in your company information (name, type, contact details)<br />
                3. Create your admin account (username, email, password)<br />
                4. Submit for approval<br />
                <br />
                <strong>After Registration:</strong><br />
                • Your account enters <Tag color="warning">Pending Approval</Tag> status<br />
                • Super admin will review and approve your business<br />
                • You'll receive access once approved<br />
                • As admin, you can then create accounts for your employees<br />
                <br />
                <strong>Adding Employees:</strong><br />
                Once your business is approved, only you (as admin) can create user accounts for your staff.<br />
                Employees cannot self-register - you control who has access.
              </Paragraph>
              <Alert 
                message="Business Registration vs User Accounts" 
                description="Business owners register their company and become the admin. Employees do not register - the admin creates their accounts." 
                type="info" 
                showIcon 
              />
            </>
          )
        }
      ]
    },
    {
      key: 'profile',
      title: 'Profile Settings',
      icon: <SettingOutlined />,
      tag: 'Account',
      tagColor: 'default',
      roles: ['admin', 'manager', 'staff'],
      items: [
        {
          question: 'How do I update my profile?',
          answer: (
            <Paragraph>
              1. Click your avatar in the top right<br />
              2. Select <strong>"Profile"</strong><br />
              3. Update your information:<br />
              &nbsp;&nbsp;&nbsp;• Full Name<br />
              &nbsp;&nbsp;&nbsp;• Email<br />
              &nbsp;&nbsp;&nbsp;• Phone Number<br />
              4. Click <strong>"Update Profile"</strong>
            </Paragraph>
          )
        },
        {
          question: 'How do I change my password?',
          answer: (
            <Paragraph>
              From your Profile page:<br />
              1. Scroll to the "Change Password" section<br />
              2. Enter your current password<br />
              3. Enter your new password<br />
              4. Confirm your new password<br />
              5. Click <strong>"Change Password"</strong><br />
              <br />
              <Alert message="Security Tip" description="Use a strong password with letters, numbers, and symbols. Don't share your password with anyone." type="info" showIcon />
            </Paragraph>
          )
        },
        {
          question: 'How do I upload a profile picture?',
          answer: (
            <Paragraph>
              1. Go to your Profile page<br />
              2. Click on your current avatar or the <strong>"Upload Picture"</strong> button<br />
              3. Select an image file (JPG, PNG)<br />
              4. The image uploads automatically<br />
              <br />
              Your new profile picture will appear in the header and throughout the system.
            </Paragraph>
          )
        },
        {
          question: 'Can I use the system on my mobile phone?',
          answer: (
            <Paragraph>
              <strong>Yes! The system is fully mobile-responsive.</strong><br />
              <br />
              <strong>Mobile Features:</strong><br />
              • Optimized layouts for small screens<br />
              • Touch-friendly buttons and forms<br />
              • Collapsible sidebar for more space<br />
              • Responsive tables that scroll horizontally<br />
              • Mobile-optimized registration forms<br />
              • Back to Top button for easy navigation<br />
              <br />
              <Alert 
                message="Best Experience" 
                description="For best mobile experience, use the latest version of Chrome, Safari, or Firefox on your smartphone." 
                type="info" 
                showIcon 
              />
            </Paragraph>
          )
        },
        {
          question: 'How do I navigate back from login/register pages?',
          answer: (
            <Paragraph>
              All authentication pages (Login, Register, Company Register) have a <strong>"Back to Home"</strong> button at the top-left corner.<br />
              <br />
              <strong>To return to welcome page:</strong><br />
              1. Look for the arrow icon with "Back to Home" text<br />
              2. Click the button<br />
              3. You'll be redirected to the welcome page<br />
              <br />
              This makes it easy to explore different registration options or return to the homepage without using browser back button.
            </Paragraph>
          )
        }
      ]
    },
    {
      key: 'system-admin',
      title: 'System Administration',
      icon: <SafetyOutlined />,
      tag: 'Admin Only',
      tagColor: 'gold',
      roles: ['admin'],
      items: [
        {
          question: 'What is the System Administration layer?',
          answer: (
            <Paragraph>
              <strong>For Business Administrators Only</strong><br />
              <br />
              As a business administrator, you have access to additional system management features:<br />
              <br />
              <strong>Your Admin Capabilities:</strong><br />
              • Manage user accounts and roles<br />
              • Control access permissions<br />
              • Create and restore database backups<br />
              • View comprehensive analytics<br />
              • Export business data<br />
              • Configure business settings<br />
              <br />
              <Alert 
                message="Administrator Responsibility" 
                description="As an admin, you're responsible for managing your business operations, users, and data security." 
                type="info" 
                showIcon 
              />
            </Paragraph>
          )
        },
        {
          question: 'How do I manage user access and permissions?',
          answer: (
            <Paragraph>
              <strong>User Role Management:</strong><br />
              1. Go to the <strong>Users</strong> page from sidebar<br />
              2. View all user accounts in your business<br />
              3. Assign roles to control access levels:<br />
              &nbsp;&nbsp;&nbsp;• <Tag color="red">Admin</Tag> - Full system access<br />
              &nbsp;&nbsp;&nbsp;• <Tag color="blue">Manager</Tag> - Sales, reports, analytics<br />
              &nbsp;&nbsp;&nbsp;• <Tag color="green">Staff</Tag> - Basic sales and products<br />
              <br />
              <strong>Best Practices:</strong><br />
              • Give users only the access they need<br />
              • Review user permissions regularly<br />
              • Remove access for inactive users<br />
              • Keep admin accounts secure<br />
              <br />
              <Alert 
                message="Security Tip" 
                description="Use strong passwords and change them regularly. Never share admin credentials." 
                type="warning" 
                showIcon 
              />
            </Paragraph>
          )
        },
        {
          question: 'How do I ensure data security for my business?',
          answer: (
            <Paragraph>
              <strong>Data Security Measures:</strong><br />
              <br />
              <strong>1. Regular Backups:</strong><br />
              • Create manual backups before major changes<br />
              • System automatically backs up your data<br />
              • Store backups securely<br />
              <br />
              <strong>2. Access Control:</strong><br />
              • Assign appropriate user roles<br />
              • Monitor user activities<br />
              • Remove inactive accounts promptly<br />
              <br />
              <strong>3. Password Security:</strong><br />
              • Enforce strong password policies<br />
              • Change passwords every 90 days<br />
              • Never share login credentials<br />
              <br />
              <strong>4. Data Privacy:</strong><br />
              • Your business data is completely isolated<br />
              • No other business can access your information<br />
              • All connections are encrypted<br />
              <br />
              <Alert 
                message="Complete Isolation" 
                description="Each business has its own separate database. Your data is private and secure." 
                type="success" 
                showIcon 
              />
            </Paragraph>
          )
        },
        {
          question: 'What should I do if I suspect unauthorized access?',
          answer: (
            <Paragraph>
              <strong>Immediate Actions:</strong><br />
              <br />
              1. <strong>Check User Activity:</strong><br />
              &nbsp;&nbsp;&nbsp;• Review recent sales and transactions<br />
              &nbsp;&nbsp;&nbsp;• Check for unfamiliar user accounts<br />
              &nbsp;&nbsp;&nbsp;• Look for unusual data changes<br />
              <br />
              2. <strong>Secure Your Account:</strong><br />
              &nbsp;&nbsp;&nbsp;• Change all admin passwords immediately<br />
              &nbsp;&nbsp;&nbsp;• Reset passwords for all user accounts<br />
              &nbsp;&nbsp;&nbsp;• Review and update user permissions<br />
              <br />
              3. <strong>Contact Support:</strong><br />
              &nbsp;&nbsp;&nbsp;• Call SAP Technologies: +256 706 564 628<br />
              &nbsp;&nbsp;&nbsp;• Email: saptechnologies256@gmail.com<br />
              &nbsp;&nbsp;&nbsp;• Provide details of suspicious activity<br />
              <br />
              4. <strong>Create a Backup:</strong><br />
              &nbsp;&nbsp;&nbsp;• Back up current data state<br />
              &nbsp;&nbsp;&nbsp;• Document any suspicious changes<br />
              <br />
              <Alert 
                message="Prevention is Key" 
                description="Regularly monitor user activity and maintain strong password practices to prevent unauthorized access." 
                type="error" 
                showIcon 
              />
            </Paragraph>
          )
        },
        {
          question: 'How do I export or download business data?',
          answer: (
            <Paragraph>
              <strong>Available Export Options:</strong><br />
              <br />
              <strong>CSV Exports:</strong><br />
              1. <strong>Products:</strong> Complete product catalog with prices and stock<br />
              2. <strong>Customers:</strong> Customer database with contact info<br />
              3. <strong>Sales:</strong> All sales transactions and orders<br />
              4. <strong>Expenses:</strong> Complete expense records<br />
              5. <strong>Users:</strong> User accounts and roles<br />
              <br />
              <strong>PDF Exports:</strong><br />
              • Individual invoices<br />
              • Sales receipts<br />
              • Custom reports<br />
              <br />
              <strong>Database Backups:</strong><br />
              1. Go to <strong>Backup & Restore</strong><br />
              2. Click <strong>"Create Backup"</strong><br />
              3. Add description (optional)<br />
              4. Backup includes all business data<br />
              5. Download backup file for safe keeping<br />
              <br />
              <Alert 
                message="Data Ownership" 
                description="Your data belongs to you. Export it anytime for your records or external analysis." 
                type="info" 
                showIcon 
              />
            </Paragraph>
          )
        }
      ]
    },
    {
      key: 'troubleshooting',
      title: 'Troubleshooting',
      icon: <QuestionCircleOutlined />,
      tag: 'Support',
      tagColor: 'magenta',
      roles: ['admin', 'manager', 'staff'],
      items: [
        {
          question: 'I forgot my password. What should I do?',
          answer: (
            <Paragraph>
              Contact your system administrator to reset your password. They can:<br />
              1. Access the Users management page<br />
              2. Find your account<br />
              3. Set a new temporary password for you<br />
              4. Provide you with the new password securely<br />
              <br />
              Once you log in, immediately change your password from your Profile page.
            </Paragraph>
          )
        },
        {
          question: 'Why can\'t I see certain menu items?',
          answer: (
            <Paragraph>
              Menu items are restricted based on your user role:<br />
              <br />
              <Tag color="green">Staff</Tag> can access:<br />
              • Dashboard, Products, Sales, Customers, Profile<br />
              <br />
              <Tag color="blue">Manager</Tag> additionally gets:<br />
              • Analytics, Invoices, Expenses, Reports<br />
              <br />
              <Tag color="red">Admin</Tag> gets everything including:<br />
              • User Management, System Settings<br />
              <br />
              Contact your administrator if you need access to additional features.
            </Paragraph>
          )
        },
        {
          question: 'The page refreshed and I lost my place. How do I prevent this?',
          answer: (
            <Paragraph>
              The system now automatically remembers which page you were on! When you refresh:<br />
              • You'll return to the same page you were viewing<br />
              • Your navigation state is preserved<br />
              • No need to navigate back manually<br />
              <br />
              This feature works automatically - no configuration needed.
            </Paragraph>
          )
        },
        {
          question: 'Numbers in reports don\'t match. What should I check?',
          answer: (
            <Paragraph>
              Common causes and solutions:<br />
              <br />
              <strong>1. Date Range:</strong> Make sure you're looking at the same time period<br />
              <strong>2. Currency:</strong> Check if you're comparing UGX to USD amounts<br />
              <strong>3. Expenses:</strong> Remember that Net Profit = Gross Profit - Expenses<br />
              <strong>4. Filters:</strong> Clear any active filters or search queries<br />
              <br />
              If numbers still don't add up, contact your administrator with:<br />
              • The specific reports you're comparing<br />
              • The date ranges you're using<br />
              • Screenshots if possible
            </Paragraph>
          )
        },
        {
          question: 'How do I report a bug or request a feature?',
          answer: (
            <Paragraph>
              <strong>Contact SAP Technologies Support:</strong><br />
              <br />
              📞 <strong>Phone:</strong> <a href="tel:+256706564628">+256 706 564 628</a><br />
              📧 <strong>Email:</strong> <a href="mailto:saptechnologies256@gmail.com">saptechnologies256@gmail.com</a><br />
              💬 <strong>WhatsApp:</strong> <a href="https://wa.me/256706564628" target="_blank" rel="noopener noreferrer">Chat with us</a><br />
              🌐 <strong>Website:</strong> <a href="https://www.sap-technologies.com" target="_blank" rel="noopener noreferrer">www.sap-technologies.com</a><br />
              <br />
              <strong>When reporting issues, please include:</strong><br />
              • Clear description of the issue or feature request<br />
              • Steps to reproduce (for bugs)<br />
              • Screenshots if applicable<br />
              • Your business name and user role<br />
              • What you expected vs. what actually happened<br />
              <br />
              <Alert 
                message="Fast Response Time" 
                description="Our support team typically responds within 24 hours on business days. For urgent issues, call us directly." 
                type="success" 
                showIcon 
              />
            </Paragraph>
          )
        },
        {
          question: 'What are the system requirements?',
          answer: (
            <Paragraph>
              <strong>Web Browser Requirements:</strong><br />
              The system works best with modern web browsers:<br />
              • Chrome 90+ (Recommended)<br />
              • Firefox 88+<br />
              • Safari 14+<br />
              • Edge 90+<br />
              <br />
              <strong>Device Compatibility:</strong><br />
              • Desktop computers (Windows, Mac, Linux)<br />
              • Laptops<br />
              • Tablets (iPad, Android tablets)<br />
              • Smartphones (responsive mobile design)<br />
              <br />
              <strong>Internet Connection:</strong><br />
              • Stable internet connection required<br />
              • Minimum 1 Mbps for basic use<br />
              • 5+ Mbps recommended for optimal performance<br />
              <br />
              <strong>Screen Resolution:</strong><br />
              • Minimum: 320px width (mobile phones)<br />
              • Recommended: 1366x768 or higher (desktop)<br />
              • Fully responsive from mobile to 4K displays
            </Paragraph>
          )
        },
        {
          question: 'What is the software version and update policy?',
          answer: (
            <Paragraph>
              <strong>Current Version:</strong> SAP Business Management System v2.0<br />
              <strong>Release Date:</strong> December 2025<br />
              <br />
              <strong>Recent Updates:</strong><br />
              • ✅ Super Admin management system<br />
              • ✅ 16 business type categories<br />
              • ✅ Complete data isolation per business<br />
              • ✅ Back to Top navigation on all pages<br />
              • ✅ Mobile-responsive design<br />
              • ✅ Enhanced security with audit logging<br />
              • ✅ Automated backup system<br />
              • ✅ Multi-currency support (UGX, USD)<br />
              <br />
              <strong>Update Policy:</strong><br />
              • Updates are deployed automatically<br />
              • No downtime for users<br />
              • New features announced via email<br />
              • Zero data loss during updates<br />
              <br />
              <Alert 
                message="Powered by SAP Technologies Uganda" 
                description="Professional software solutions designed for African businesses." 
                type="info" 
                showIcon 
              />
            </Paragraph>
          )
        }
      ]
    }
  ]

  // Filter sections based on user role and search query
  const filteredSections = helpSections
    .filter(section => !section.roles || section.roles.includes(userRole)) // Filter by role
    .map(section => ({
      ...section,
      items: section.items.filter(item =>
        item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        section.title.toLowerCase().includes(searchQuery.toLowerCase())
      )
    })).filter(section => section.items.length > 0)

  // Auto-expand sections when searching
  React.useEffect(() => {
    if (searchQuery) {
      setActiveKeys(filteredSections.map(s => s.key))
    } else {
      setActiveKeys([])
    }
  }, [searchQuery])

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px', textAlign: 'center' }}>
        <BookOutlined style={{ fontSize: '48px', color: '#1890ff', marginBottom: '16px' }} />
        <Title level={2}>Help & Documentation</Title>
        <Paragraph type="secondary" style={{ fontSize: '16px' }}>
          Find answers to common questions and learn how to use all features
        </Paragraph>
      </div>

      {/* Search Bar */}
      <Card style={{ marginBottom: '24px' }}>
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          {user && userRole !== 'staff' && (
            <Alert
              message={
                <span>
                  Viewing help as: <Tag color={userRole === 'superadmin' ? 'red' : userRole === 'admin' ? 'red' : userRole === 'manager' ? 'blue' : 'green'}>
                    {userRole === 'superadmin' ? 'Super Admin' : userRole.charAt(0).toUpperCase() + userRole.slice(1)}
                  </Tag>
                </span>
              }
              description="Documentation is customized based on your role and permissions"
              type="info"
              showIcon
              style={{ marginBottom: 0 }}
            />
          )}
          <Search
            placeholder="Search for help topics (e.g., 'how to add product', 'change password', 'view reports')"
            allowClear
            enterButton="Search"
            size="large"
            prefix={<SearchOutlined />}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </Space>
      </Card>

      {/* Quick Links */}
      {!searchQuery && (
        <Card title="🚀 Quick Start Guides" style={{ marginBottom: '24px' }}>
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={8}>
              <Button
                type="link"
                icon={<ShoppingCartOutlined />}
                onClick={() => {
                  setSearchQuery('create a new sale')
                }}
                block
              >
                How to Create a Sale
              </Button>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Button
                type="link"
                icon={<ShoppingOutlined />}
                onClick={() => {
                  setSearchQuery('add a new product')
                }}
                block
              >
                How to Add Products
              </Button>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Button
                type="link"
                icon={<DollarOutlined />}
                onClick={() => {
                  setSearchQuery('record daily expenses')
                }}
                block
              >
                How to Record Expenses
              </Button>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Button
                type="link"
                icon={<BarChartOutlined />}
                onClick={() => {
                  setSearchQuery('analytics are available')
                }}
                block
              >
                Understanding Analytics
              </Button>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Button
                type="link"
                icon={<UserOutlined />}
                onClick={() => {
                  setSearchQuery('change my password')
                }}
                block
              >
                Change Your Password
              </Button>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Button
                type="link"
                icon={<FileTextOutlined />}
                onClick={() => {
                  setSearchQuery('generate an invoice')
                }}
                block
              >
                Generate Invoices
              </Button>
            </Col>
          </Row>
        </Card>
      )}

      {/* Help Sections */}
      {filteredSections.length > 0 ? (
        filteredSections.map(section => (
          <Card
            key={section.key}
            title={
              <Space>
                {section.icon}
                <span>{section.title}</span>
                <Tag color={section.tagColor}>{section.tag}</Tag>
              </Space>
            }
            style={{ marginBottom: '16px' }}
          >
            <Collapse
              activeKey={activeKeys}
              onChange={setActiveKeys}
              expandIconPosition="end"
            >
              {section.items.map((item, index) => (
                <Panel
                  header={
                    <Text strong>
                      <QuestionCircleOutlined style={{ marginRight: '8px', color: '#1890ff' }} />
                      {item.question}
                    </Text>
                  }
                  key={`${section.key}-${index}`}
                >
                  {item.answer}
                </Panel>
              ))}
            </Collapse>
          </Card>
        ))
      ) : (
        <Card>
          <div style={{ textAlign: 'center', padding: '48px 0' }}>
            <SearchOutlined style={{ fontSize: '64px', color: '#d9d9d9', marginBottom: '16px' }} />
            <Title level={4} type="secondary">No results found</Title>
            <Paragraph type="secondary">
              Try different keywords or browse the categories above
            </Paragraph>
            <Button type="primary" onClick={() => setSearchQuery('')}>
              Clear Search
            </Button>
          </div>
        </Card>
      )}

      {/* Footer */}
      <Divider />
      <div style={{ textAlign: 'center', marginTop: '32px' }}>
        <Alert
          message="Need More Help?"
          description={
            <div>
              <Paragraph style={{ margin: '0 0 12px 0' }}>
                If you can't find the answer you're looking for, contact SAP Technologies support team.
              </Paragraph>
              <Space size="large" wrap style={{ justifyContent: 'center' }}>
                <a href="tel:+256706564628" style={{ color: '#1890ff' }}>
                  📞 +256 706 564 628
                </a>
                <a href="mailto:saptechnologies256@gmail.com" style={{ color: '#1890ff' }}>
                  📧 Email Support
                </a>
                <a href="https://wa.me/256706564628" target="_blank" rel="noopener noreferrer" style={{ color: '#25D366', fontWeight: '500' }}>
                  💬 WhatsApp Chat
                </a>
              </Space>
            </div>
          }
          type="info"
          showIcon
        />
      </div>
      <BackToTop />
    </div>
  )
}

export default Help
