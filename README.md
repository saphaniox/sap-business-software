# SAP Business Management System

A modern, full-stack multi-tenant SaaS platform for managing business operations. Built with React, Node.js, and PostgreSQL, featuring real-time notifications, multi-currency support, automated backups, and comprehensive reporting.

## ✨ Features

### 🏢 Multi-Tenant Architecture
- Complete data isolation between businesses
- Support for 16+ industry types
- Flexible PostgreSQL database with Neon
- Company branding (logo, colors, themes)

### 💰 Multi-Currency Support
- 15+ global currencies (UGX, USD, EUR, GBP, KES, TZS, RWF, ZAR, NGN, GHS, INR, AED, SAR, CNY, JPY)
- Real-time currency conversion
- Currency-specific formatting

### 📊 Business Management
- **Inventory**: Stock tracking, low stock alerts, demand analytics
- **Sales**: Order processing, profit calculations, sales trends
- **Customers**: Contact management, purchase history
- **Invoicing**: Professional invoices with logo, multi-currency support
- **Returns**: Return handling, refund tracking, auto inventory adjustment
- **Expenses**: Expense tracking, category management, reporting

### 📈 Analytics & Reporting
- Export to Excel, CSV, PDF
- Sales summary, stock status, profit analytics
- Top products, low stock reports
- Daily/weekly/monthly trends

### 🔔 Real-Time Features
- In-app notification center
- Auto-save drafts (localStorage)
- Live data updates
- Keyboard shortcuts (Ctrl+S, Esc)

### 🔐 Security
- JWT authentication
- Role-based access control (Admin, Manager, Sales, Inventory, Accountant)
- Password hashing (bcrypt)
- SQL injection protection
- CORS configuration
- **Expense Tracking**: Record expenses by category, date filters, spending analytics

### 📈 Analytics & Insights
- Real-time dashboard with sales, profits, top products
- Product demand analytics and trending items
- Profit/loss tracking with margins
- Stock status reports with color coding
- Sales trends and forecasting
- Export all reports to Excel/PDF

### 👥 User Management
- **Role-Based Access**: Admin (full access), Manager (operations), Staff (basic sales)
- Unlimited users per business
- Activity tracking and audit trails
- Edit history on sales orders
- Permission-based feature access

### 🔒 Security & Performance
- JWT authentication with secure tokens
- Password hashing with bcrypt
- Account lockout after failed login attempts
- Rate limiting on API endpoints
- Input sanitization and validation
- Secure API endpoints with middleware
- Session management and timeout

## 🏗️ Technology Stack

### Backend
- **Runtime**: Node.js with Express.js
- **Database**: MongoDB (v6.0+) with Mongoose ODM
- **Authentication**: JWT (jsonwebtoken) with bcrypt password hashing
- **Security**: express-rate-limit, helmet, cors, express-validator
- **File Handling**: multer for logo/profile uploads
- **Backups**: Automated backup system with restore capability
- **Export**: JSON data transformation for Excel/CSV/PDF generation

### Frontend
- **Framework**: React 18.2.0 with Vite 5.4.21 (fast development & builds)
- **UI Library**: Ant Design 5.11.2 (antd) for professional components
- **Routing**: React Router DOM 6.20.1
- **State Management**: Zustand for auth state, React Context API for currency
- **HTTP Client**: Axios for API communication
- **Charts & Visualization**: Recharts for analytics dashboards
- **Export Libraries**:
  - **xlsx**: Export to Excel (.xlsx) format with styling
  - **file-saver**: Save exported files to user's device
  - **papaparse**: Export to CSV format with headers
  - **jspdf**: Generate PDF documents
  - **jspdf-autotable**: Format tables in PDF exports
- **Icons**: Ant Design Icons (comprehensive icon library)
- **Styling**: CSS with Ant Design theming and responsive design

## 🛠️ Tech Stack

### Backend
- **Runtime**: Node.js + Express.js
- **Database**: PostgreSQL with Neon (3GB free tier)
- **ORM**: Native pg driver with connection pooling
- **Authentication**: JWT + bcrypt
- **File Upload**: Multer
- **Validation**: Express-validator

### Frontend
- **Framework**: React 18 + Vite
- **UI Library**: Ant Design 5
- **Routing**: React Router v6
- **State**: Zustand + Context API
- **HTTP**: Axios
- **Charts**: Recharts
- **Export**: xlsx, jspdf, papaparse

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL (Neon account - free tier)

### Installation

**1. Clone Repository**
```bash
git clone <repository-url>
cd sap-business-management-system
```

**2. Backend Setup**
```bash
cd server
npm install

# Create .env file
echo "PORT=9000
DATABASE_URL=your_neon_connection_string
JWT_SECRET=your-secret-key-change-this
NODE_ENV=development
ALLOWED_ORIGINS=http://localhost:5173" > .env
```

**3. Frontend Setup**
```bash
cd ../client
npm install

# Create .env file
echo "VITE_API_URL=http://localhost:9000/api" > .env
```

**4. Start Development**
```bash
# Terminal 1 - Backend
cd server
npm start

# Terminal 2 - Frontend
cd client
npm run dev
```

Access: http://localhost:5173

## 📦 Database Setup (Neon PostgreSQL)

1. Create free account at [neon.tech](https://neon.tech)
2. Create new project
3. Copy connection string
4. Add to `server/.env`:
```env
DATABASE_URL=postgresql://user:password@host/database?sslmode=require
```
5. Tables auto-create on first server start

### 4. Start MongoDB

Make sure MongoDB is running on your system:
```bash
# Windows (if installed as service)
net start MongoDB

# Linux/Mac
sudo systemctl start mongod
```

### 5. Run the Application

**Terminal 1 - Server:**
```bash
cd server
npm run dev
```

**Terminal 2 - Client:**
```bash
cd client
npm run dev
```

The application will be available at:
- Frontend: http://localhost:5100
- Backend API: http://localhost:9000

## 📖 Usage Guide

### Company Registration

1. Navigate to the application homepage
2. Click "Register Your Company"
3. Fill in company details:
   - Company name
   - Business type (16+ industry types: retail, restaurant, pharmacy, supermarket, etc.)
   - **Currency Selection**: Choose from 15+ global currencies (🇺🇬 UGX, 🇺🇸 USD, 🇪🇺 EUR, 🇬🇧 GBP, etc.)
   - Contact information
   - **Upload Company Logo** (optional)
   - Database preference (Shared/Dedicated)
   - Admin account credentials
4. Submit to create your company account
5. Start using the system immediately with your selected currency

### User Login

1. Go to the login page
2. (Optional) Enter company name if you have multiple accounts
3. Enter username and password
4. Access your company dashboard

### Managing Your Business

#### Products
- Add new products with SKU, pricing, and stock levels
- Update inventory quantities
- Set minimum stock alerts
- Track product demand and trending items
- View automatic profit calculations and margins
- **Export products to Excel, CSV, or PDF**
- See color-coded stock status (In Stock, Low Stock, Out of Stock)

#### Sales
- Create sales orders with automatic stock deduction
- **Custom pricing per transaction** (override product prices)
- View real-time profit calculations
- **Print POS-style receipts** with your company logo
- Track sales history with edit history
- Export sales data to Excel/CSV/PDF
- **Keyboard shortcuts**: Ctrl+S to save, Esc to cancel

#### Invoices
- Generate professional invoices with company logo
- Send invoices to customers via email (planned)
- Track invoice status (Paid, Pending, Overdue)
- Export invoices to PDF for printing
- All amounts display in your company currency

#### Customers
- Store customer information securely
- Track purchase history per customer
- View total purchases and payment records
- Export customer database to Excel/CSV

#### Expenses
- Record business expenses by category
- Filter by date range
- Track spending patterns
- Export expense reports to Excel/PDF
- Monitor monthly/yearly expense trends

#### Returns
- Handle product returns efficiently
- Automatic inventory adjustment
- Refund tracking in your currency
- Export return records

#### Analytics Dashboard
- Real-time sales and profit visualization
- Top-selling products analysis
- Stock status overview with color coding
- Revenue trends with charts
- **Export all analytics to Excel/PDF**

### Advanced Features

#### Multi-Currency
- Change your company currency anytime in **Business Settings**
- All prices, reports, and documents update automatically
- Supports 15+ currencies: UGX, USD, EUR, GBP, KES, TZS, RWF, ZAR, NGN, GHS, INR, AED, SAR, CNY, JPY

#### Notifications Center
- Click the **bell icon** in navigation to see all notifications
- Real-time alerts for low stock, sales, expenses, system events
- Color-coded by type (success, warning, info)
- Mark as read or delete notifications
- Clear all read notifications with one click

#### Backup & Restore
- Go to **Backup** page to view all backups
- Create manual backups anytime
- Schedule automatic backups
- Download backup files to external storage
- Restore entire database from backup with one click

#### Keyboard Shortcuts
- **Ctrl+S**: Save forms (Sales, Products, Expenses, etc.)
- **Esc**: Cancel/close modals and forms
- Works throughout the application for faster data entry

#### Auto-Save
- Forms automatically save to browser localStorage
- Recover unsaved work if browser closes unexpectedly
- Draft data persists until form submission

#### Export Anywhere
- Look for the **Export** button on any data table
- Choose format: Excel (.xlsx), CSV (.csv), or PDF
- Professional formatting with your company logo on PDFs
- Headers, filters, and current date included automatically

## 🔒 Security Features

- **Password Requirements**: Minimum 8 characters, complexity validation
- **JWT Tokens**: 7-day expiration, includes business context and user roles
- **Role-Based Access**: Granular permissions per business (Admin, Manager, Staff)
- **Complete Data Isolation**: Multi-layered approach ensuring businesses cannot access each other's data
- **API Rate Limiting**: Protection against abuse and DDoS attacks
- **Input Sanitization**: Protection against NoSQL injection and XSS attacks
- **CORS Configuration**: Controlled cross-origin requests, whitelist-based
- **Automatic Query Filtering**: All database queries automatically scoped to the authenticated business
- **Session Management**: Automatic logout on token expiration
- **Account Lockout**: Protection against brute force attacks
- **Secure File Uploads**: Validated file types and size limits for logos/profiles

**See [DATA_ISOLATION_SECURITY.md](DATA_ISOLATION_SECURITY.md) for comprehensive security documentation.**

## 🗄️ Database Architecture

### Main Database (sap_main_database)
Stores central data for all companies:
- `companies` - Company/tenant information
- `users` - All user accounts with company_id reference

### Tenant Databases
Each company can have:
- **Shared**: Data stored in main database with company_id filters
- **Dedicated**: Separate database (sap_companyname_timestamp) containing:
  - products
  - customers
  - sales_orders
  - invoices
  - returns
  - expenses
  - stock_transactions

## 🔧 API Endpoints

### Authentication
```
POST /api/auth/register - Register new user (requires company_id)
POST /api/auth/login - Login user
```

### Company Management
```
POST /api/company/register - Register new company
GET /api/company/me - Get current company details
PUT /api/company/me - Update company settings
GET /api/company/all - Get all companies (super admin)
```

### Products
```
GET /api/products - List products (paginated, company-scoped)
POST /api/products - Create product
PUT /api/products/:id - Update product
DELETE /api/products/:id - Delete product
```

### Sales, Customers, Invoices, Returns, Expenses
Similar RESTful patterns with automatic company-scoping

## 🎨 Customization & Branding

The system is highly customizable per company:
- **Company Logo**: Upload your logo during registration or in Business Settings
- **Logo Branding**: Your logo appears on invoices, receipts, and all PDF exports
- **Currency Settings**: Choose from 15+ global currencies, change anytime
- **Industry Type**: Select from 16+ business types for tailored features
- **User Roles**: Admin, Manager, Staff - customize permissions per role
- **Backup Schedule**: Configure automatic backup frequency
- **Timezone Configuration**: (future enhancement)
- **Date Format Preferences**: (future enhancement)
- **Language Options**: Multi-language support stored in company settings (future)

## 🚀 Deployment

### Quick Start Deployment

The application is currently deployed on:
- **Frontend**: Vercel (automatic deployment from GitHub)
- **Backend**: Render (Node.js API server)
- **Database**: MongoDB Atlas (cloud-hosted)

For step-by-step deployment instructions, see:

- **[DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md)** - Complete deployment guide
- **[QUICK_START.md](QUICK_START.md)** - Getting started guide

### Production Environment Variables

**Server (.env):**
```env
NODE_ENV=production
MONGODB_URL=mongodb+srv://username:password@cluster.mongodb.net/sapdb
JWT_SECRET=your-production-secret-key-change-this-to-random-string
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
PORT=9000
```

**Client (.env):**
```env
VITE_API_URL=https://your-backend-api.com/api
```

### Build for Production

**Client:**
```bash
cd client
npm run build
# Output in client/dist folder - deploy to Vercel, Netlify, or any static host
```

**Server:**
```bash
cd server
npm start
# Runs production server on PORT from .env (default 9000)
```

### Vercel Deployment (Frontend)

1. Push code to GitHub repository
2. Import repository in Vercel dashboard
3. Configure build settings:
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Root Directory: `client`
   - Environment Variables: Add `VITE_API_URL`
4. Deploy - Vercel auto-deploys on every push to main branch

### Render Deployment (Backend)

1. Create new Web Service on Render
2. Connect GitHub repository
3. Configure:
   - Root Directory: `server`
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Environment Variables: Add all from .env
4. Deploy - Render auto-deploys on every push

### MongoDB Atlas Setup

1. Create free cluster at mongodb.com/cloud/atlas
2. Create database user with password
3. Whitelist IP addresses (0.0.0.0/0 for cloud deployments)
4. Get connection string: `mongodb+srv://username:password@cluster.mongodb.net/sapdb`
5. Add to server .env as MONGODB_URL

### Supported Platforms

- ✅ **Vercel** (frontend - automatic GitHub integration)
- ✅ **Render** (backend API - Node.js hosting)
- ✅ **Netlify** (frontend alternative)
- ✅ **Railway** (backend alternative)
- ✅ **MongoDB Atlas** (database - recommended)
- ✅ **Docker** (any cloud provider with container support)
- ✅ **AWS** (EC2 for backend, S3+CloudFront for frontend)
- ✅ **Traditional Servers** (VPS, dedicated hosting with Node.js)

### CI/CD Pipeline

GitHub Actions can automatically:
- ✅ Run tests on every push
- ✅ Build frontend and backend
- ✅ Deploy to staging/production environments
- ✅ Run database migrations
- ✅ Deploys to AWS S3 + CloudFront
- ✅ Deploys backend to EC2
- ✅ Runs smoke tests
- ✅ Notifies on deployment status

See `.github/workflows/deploy.yml` for configuration.

## 📊 Multi-Tenancy Strategy


### Shared Database (Recommended for most businesses)
- ✅ Cost-effective - lower hosting costs
- ✅ Easy maintenance - single database to manage
- ✅ Automatic backups - built-in backup system
- ✅ Quick setup - instant company creation
- ⚠️ Logical data isolation via company_id filtering

### Dedicated Database (Enterprise option)
- ✅ Complete physical data isolation
- ✅ Enhanced security - separate database per business
- ✅ Performance optimization - dedicated resources
- ✅ Custom backup schedules per business
- ⚠️ Higher resource usage and hosting costs

## 🎯 Roadmap

### Coming Soon
- 📧 Email invoices to customers
- 📱 Mobile app (React Native)
- 🎥 Video tutorials for all features
- 🌍 Multi-language support (English, French, Swahili, etc.)
- 💱 Currency conversion with live exchange rates
- 📊 Advanced financial reports (balance sheet, P&L statement)
- 🔔 Push notifications for mobile app
- 📲 SMS notifications for low stock and sales

### Under Consideration
- Integration with payment gateways (Stripe, PayPal, Flutterwave)
- Barcode scanner for product entry
- E-commerce integration (WooCommerce, Shopify sync)
- API access for third-party integrations
- Multi-location support (branches/warehouses)

## 🤝 Contributing

We welcome contributions! Here's how to get started:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Code Standards
- Follow existing code style (ESLint config provided)
- Write meaningful commit messages
- Add comments for complex logic
- Update README if adding new features
- Test thoroughly before submitting PR

## 📚 Additional Documentation

- **[QUICK_START.md](QUICK_START.md)** - Getting started guide
- **[DATA_ISOLATION_SECURITY.md](DATA_ISOLATION_SECURITY.md)** - Security architecture
- **[DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md)** - Production deployment steps
- **[TESTING_GUIDE.md](TESTING_GUIDE.md)** - Testing strategies
- **[SUPER_ADMIN_GUIDE.md](SUPER_ADMIN_GUIDE.md)** - Super admin features
- **[INDUSTRY_IMPLEMENTATION.md](INDUSTRY_IMPLEMENTATION.md)** - Industry-specific setup
- **[RESPONSIVE_DESIGN.md](RESPONSIVE_DESIGN.md)** - Mobile responsiveness
- **[MIGRATION_GUIDE.md](MIGRATION_GUIDE.md)** - Version migration instructions

## 📝 License

This project is proprietary software. All rights reserved.

## 👥 Support & Contact

For support, questions, or business inquiries:

- 📧 Email: saptechnologies256@gmail.com
- 📱 Phone/WhatsApp: +256 706 564 628
- 📖 Documentation: Available in repository docs/
- 🐛 Issue Tracker: GitHub Issues tab
- 💬 Community: Coming soon (Discord/Slack)

**Business Hours**: Monday - Friday, 8 AM - 6 PM (EAT - East Africa Time)

## 🏆 Success Stories

Used by businesses across East Africa:
- 🛒 Retail stores managing 1000+ products
- 🍕 Restaurants tracking daily sales and inventory
- 💊 Pharmacies with strict stock management
- 🏪 Supermarkets with multi-currency support
- 🔧 Hardware stores with profit tracking

## 🔄 Version History

### Version 3.0.0 (Current - 2024)
- 🌍 Multi-currency support (15+ global currencies)
- 📤 Export to Excel, CSV, PDF
- 🔔 In-app notifications center
- ⌨️ Keyboard shortcuts (Ctrl+S, Esc)
- 💾 Auto-save drafts to localStorage
- 🎨 Loading skeletons and empty states
- ⚠️ Confirmation dialogs for destructive actions
- 🏢 Company logo branding on all documents
- 📊 Enhanced analytics and profit tracking
- 🔄 Edit history and audit trails
- 🔍 Advanced search and filtering
- 📝 Custom pricing per transaction
- 🧾 POS-style thermal receipts

### Version 2.0.0 (2023)
- Multi-tenant architecture
- Company registration system
- Flexible database options (shared/dedicated)
- Enhanced security with complete data isolation
- Company-specific settings and branding
- Role-based access control
- Rebranded to SAP Business Management Software

### Version 1.0.0 (2022)
- Single-tenant system
- Basic inventory and sales management
- Initial release for local market

---

**Built with ❤️ for modern businesses worldwide**

