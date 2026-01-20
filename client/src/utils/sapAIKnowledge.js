/**
 * SAP Business AI Assistant Knowledge Base
 * Contains all information about the SAP Business Management System
 * This assistant ONLY answers questions about this SAP system - not other businesses or external topics
 */

export const sapAIKnowledge = {
  // System Overview
  system: {
    name: "SAP Business Management System",
    description: "A comprehensive business management platform for small to medium enterprises",
    purpose: "Helps businesses manage sales, inventory, customers, invoices, expenses, and generate intelligent insights",
    target_users: "Retail stores, wholesale businesses, service providers, and SMEs",
    pricing: "Contact admin for pricing information",
    platforms: "Web application, Android APK mobile app, and SDK for Windows and other operating systems",
    scope: "This AI assistant ONLY provides information about the SAP Business Management System features, policies, and functionality. It cannot answer questions about other users' business data, external businesses, or topics outside this system."
  },

  // Core Features
  features: {
    sales_management: {
      name: "Sales Management",
      description: "Create and track sales orders with real-time inventory updates",
      capabilities: [
        "Create sales orders with multiple products",
        "Track order status (pending/completed)",
        "Support for UGX and USD currencies",
        "Automatic inventory deduction",
        "Sales history and analytics",
        "Customer information recording"
      ]
    },
    invoice_management: {
      name: "Invoice Management",
      description: "Generate professional invoices for customers",
      capabilities: [
        "Create invoices from sales orders or directly",
        "Add custom pricing for products",
        "Print and download invoices as PDF",
        "Track invoice status",
        "Multiple currency support",
        "Customer details on invoices"
      ]
    },
    inventory_management: {
      name: "Inventory Management",
      description: "Manage products and stock levels efficiently",
      capabilities: [
        "Add, edit, and delete products",
        "Track stock quantities in real-time",
        "Set reorder points for low stock alerts",
        "Categorize products",
        "Cost and selling price management",
        "Stock transaction history",
        "Out-of-stock notifications"
      ]
    },
    customer_management: {
      name: "Customer Management",
      description: "Maintain customer database and track relationships",
      capabilities: [
        "Add customer details (name, phone, email, address)",
        "View customer purchase history",
        "Track total spending per customer",
        "Customer segmentation",
        "Export customer data"
      ]
    },
    expense_tracking: {
      name: "Expense Tracking",
      description: "Record and categorize business expenses",
      capabilities: [
        "Add expenses with categories",
        "Attach receipts and notes",
        "Track payment methods",
        "Monthly/yearly expense reports",
        "Expense analytics"
      ]
    },
    returns_management: {
      name: "Returns Management",
      description: "Handle product returns and refunds",
      capabilities: [
        "Process return requests",
        "Automatic inventory restoration",
        "Refund tracking",
        "Return reasons documentation"
      ]
    },
    ai_analytics: {
      name: "AI-Powered Analytics",
      description: "Intelligent insights powered by artificial intelligence",
      capabilities: [
        "Sales forecasting (30-day predictions)",
        "Smart inventory recommendations",
        "Customer insights and segmentation",
        "AI chatbot for business questions",
        "Fraud detection and security monitoring",
        "Document processing (OCR ready)"
      ]
    },
    reporting: {
      name: "Reports & Analytics",
      description: "Comprehensive business intelligence and reporting",
      capabilities: [
        "Daily, weekly, monthly reports",
        "Top products analysis",
        "Revenue tracking",
        "Profit margin calculations",
        "Export reports to CSV/PDF",
        "Visual charts and graphs"
      ]
    },
    user_management: {
      name: "User Management",
      description: "Role-based access control for team members",
      capabilities: [
        "Admin and Staff roles",
        "Granular permissions",
        "User activity tracking",
        "Profile management"
      ]
    },
    multi_company: {
      name: "Multi-Company Support",
      description: "Manage multiple businesses from one account",
      capabilities: [
        "Register multiple companies",
        "Separate data isolation",
        "Company-specific branding",
        "Logo customization",
        "Independent user management"
      ]
    }
  },

  // Getting Started
  getting_started: {
    registration: {
      question: "How do I register?",
      answer: "Click 'Get Started' or 'Register' on the homepage, choose to register a company or as a user, fill in your details (company name, email, password), and submit. You'll receive confirmation once approved."
    },
    login: {
      question: "How do I log in?",
      answer: "Click 'Login' button, enter your email and password. If you're a super admin, use the super admin login option."
    },
    first_steps: {
      question: "What should I do after registration?",
      answer: "After logging in: 1) Set up your company profile and add logo, 2) Add products to inventory, 3) Add customer information, 4) Start creating sales orders or invoices, 5) Explore the analytics dashboard"
    },
    dashboard: {
      question: "What can I see on the dashboard?",
      answer: "The dashboard shows: Total revenue, total orders, low stock alerts, recent sales, top products, sales trends, quick access to all features, and AI-powered insights."
    }
  },

  // Policies
  policies: {
    terms_conditions: {
      title: "Terms and Conditions",
      summary: "By using SAP Business Management System, you agree to use the platform responsibly, maintain accurate data, protect your account credentials, and comply with applicable laws. We provide the service 'as-is' and reserve the right to modify features.",
      key_points: [
        "Users must provide accurate information",
        "Account security is user's responsibility",
        "Data belongs to the company that created it",
        "Service may be modified or discontinued",
        "Prohibited uses: illegal activities, system abuse"
      ]
    },
    privacy_policy: {
      title: "Privacy Policy",
      summary: "We collect business and user information to provide our services. Your data is encrypted, stored securely, and never sold to third parties. Each company's data is isolated and only accessible to authorized users.",
      key_points: [
        "Data collection: Company info, user details, business transactions",
        "Data usage: Service provision, analytics, system improvements",
        "Data security: Encryption, secure databases, access controls",
        "Data sharing: Never sold, only shared when legally required",
        "User rights: Access, modify, delete your data",
        "Multi-tenant isolation: Complete data separation between companies"
      ]
    },
    cookie_policy: {
      title: "Cookie Policy",
      summary: "We use cookies to maintain your session, remember preferences, and analyze system usage. You can control cookies through your browser settings.",
      key_points: [
        "Essential cookies: Authentication, session management",
        "Performance cookies: Analytics and system optimization",
        "Preference cookies: Remember your settings",
        "No third-party advertising cookies",
        "Can be disabled via browser settings"
      ]
    },
    refund_policy: {
      title: "Refund Policy",
      summary: "SAP Business Management System is free to use. Premium features (if applicable) may be refunded within 30 days if not satisfied.",
      key_points: [
        "Free tier: Always free, no refunds needed",
        "Premium features: 30-day money-back guarantee",
        "Refund process: Contact support with reason",
        "Processing time: 5-10 business days"
      ]
    },
    acceptable_use: {
      title: "Acceptable Use Policy",
      summary: "Use the system for legitimate business purposes only. Prohibited activities include: data theft, system hacking, spam, illegal transactions, or abusive behavior.",
      key_points: [
        "Legitimate business use only",
        "No unauthorized access attempts",
        "No data scraping or automated abuse",
        "No illegal transactions recording",
        "Respect other users and system resources"
      ]
    },
    data_protection: {
      title: "Data Protection",
      summary: "We implement industry-standard security measures including encryption, secure authentication, regular backups, and compliance with data protection regulations.",
      key_points: [
        "AES-256 encryption for sensitive data",
        "Secure HTTPS connections",
        "Regular automated backups",
        "Access logging and monitoring",
        "GDPR-compliant data handling",
        "Right to data portability and deletion"
      ]
    }
  },

  // Pricing
  pricing: {
    info: "SAP Business Management System pricing is customized based on your business needs, size, and required features.",
    message: "For detailed pricing information and to discuss a plan that fits your business, please contact the administrator.",
    contact_methods: [
      "Email: sales@sapbusiness.com",
      "Support: support@sapbusiness.com",
      "Website: https://sap-business-management-system.vercel.app"
    ]
  },

  // FAQs
  faqs: [
    {
      question: "Is SAP Business Management System free?",
      answer: "SAP Business Management System is a premium business software. Pricing is customized based on your business requirements. Please contact the administrator at sales@sapbusiness.com for detailed pricing information tailored to your needs."
    },
    {
      question: "Do I need to install any software?",
      answer: "You have multiple options: 1) Use the web-based application - access it directly from your browser on any device, 2) Download the Android APK mobile app for Android devices, or 3) Install the SDK for Windows and other operating systems. All options provide full access to the system features."
    },
    {
      question: "Can I use it on my phone?",
      answer: "Yes! The system is fully responsive and works perfectly on mobile devices. You can manage your business from anywhere with an internet connection."
    },
    {
      question: "How many products can I add?",
      answer: "Unlimited! There's no restriction on the number of products, sales orders, invoices, or customers you can manage."
    },
    {
      question: "Can multiple people use the same account?",
      answer: "Yes! Admins can invite team members and assign roles (Admin or Staff) with specific permissions for different features."
    },
    {
      question: "Is my data secure?",
      answer: "Absolutely! We use bank-level encryption, secure authentication, regular backups, and complete data isolation between companies. Your data is stored in secure MongoDB databases."
    },
    {
      question: "Can I export my data?",
      answer: "Yes! You can export reports, invoices, and sales data to CSV and PDF formats. You can also request a full data export from your account."
    },
    {
      question: "What currencies are supported?",
      answer: "Currently, we support Ugandan Shillings (UGX) and US Dollars (USD). You can switch between currencies for each transaction."
    },
    {
      question: "How does the AI chatbot work?",
      answer: "Our AI chatbot uses natural language processing to understand your business questions. Ask about sales trends, inventory levels, top customers, forecasts, and more. It provides instant insights based on your actual business data."
    },
    {
      question: "What is fraud detection?",
      answer: "Our AI-powered fraud detection monitors transactions for suspicious patterns like unusual amounts, after-hours activity, excessive discounts, and duplicate customers. Admins receive alerts for potential security issues."
    },
    {
      question: "Can I manage multiple businesses?",
      answer: "Yes! You can register multiple companies under different accounts. Each company has completely separate data, users, and settings."
    },
    {
      question: "How do I get support?",
      answer: "You can access the Help section in your dashboard, contact support via email, or use the support ticket system. We also have comprehensive documentation and this AI assistant!"
    },
    {
      question: "What happens if I delete something by mistake?",
      answer: "Admins have full control to delete items, but deletions are permanent. We recommend creating regular backups using the Backup feature in your dashboard."
    },
    {
      question: "Can I customize invoices with my logo?",
      answer: "Yes! Upload your company logo in the Company Settings, and it will automatically appear on all your invoices and printouts."
    },
    {
      question: "How accurate is the sales forecasting?",
      answer: "Our AI analyzes your historical sales data using multiple algorithms (moving averages, linear regression, exponential smoothing) to predict trends. Accuracy improves with more data - we recommend at least 7 days of sales history."
    },
    {
      question: "What if I run out of stock?",
      answer: "The system prevents selling out-of-stock items. You'll see low stock alerts on your dashboard, and the AI can recommend reorder quantities based on your sales velocity."
    },
    {
      question: "Can I process returns?",
      answer: "Yes! Use the Returns Management feature to process customer returns. The system automatically restores inventory and tracks refunds."
    },
    {
      question: "Is there a mobile app?",
      answer: "Yes! We offer multiple installation options: a mobile-responsive web application, a dedicated Android APK app for Android devices, and an SDK for Windows and other operating systems. All options provide full access to all features and work seamlessly."
    },
    {
      question: "How long is data stored?",
      answer: "Your data is stored indefinitely as long as your account is active. We recommend downloading regular backups for your records."
    },
    {
      question: "Can I import data from Excel?",
      answer: "You can add products, customers, and transactions manually through the interface. Bulk import features are planned for future updates."
    }
  ],

  // Technical Information
  technical: {
    technologies: "Built with React, Node.js, Express, MongoDB, and Ant Design",
    security: "HTTPS encryption, JWT authentication, MongoDB security, rate limiting, XSS protection",
    browser_support: "Chrome, Firefox, Safari, Edge (latest versions)",
    mobile_support: "Fully responsive design works on all screen sizes",
    uptime: "99.9% uptime target with automated monitoring",
    backups: "Automatic daily backups with manual backup options"
  },

  // Contact Information
  contact: {
    support_email: "support@sapbusiness.com",
    general_email: "info@sapbusiness.com",
    website: "https://sap-business-management-system.vercel.app",
    response_time: "Within 24-48 hours for support tickets"
  }
};

/**
 * Search the knowledge base for relevant information
 */
export const searchKnowledge = (query) => {
  const normalizedQuery = query.toLowerCase().trim();
  const results = [];

  // System overview/general questions
  if (matchesKeywords(normalizedQuery, ['what is', 'what is sap', 'tell me about', 'about sap', 'system', 'overview', 'describe'])) {
    results.push({
      type: 'system',
      title: 'About SAP Business Management System',
      content: `**${sapAIKnowledge.system.name}**\n\n${sapAIKnowledge.system.description}\n\n**Purpose:** ${sapAIKnowledge.system.purpose}\n\n**Target Users:** ${sapAIKnowledge.system.target_users}\n\n**Pricing:** ${sapAIKnowledge.system.pricing}\n\n**Available On:** ${sapAIKnowledge.system.platforms}`,
      relevance: 'high'
    });
  }

  // Check if query is about registration/getting started
  if (matchesKeywords(normalizedQuery, ['register', 'sign up', 'create account', 'getting started', 'how to start', 'how do i register', 'how to register'])) {
    results.push({
      type: 'getting_started',
      title: 'Getting Started & Registration',
      content: sapAIKnowledge.getting_started.registration.answer,
      relevance: 'high'
    });
  }

  // Check if query is about login
  if (matchesKeywords(normalizedQuery, ['login', 'sign in', 'access', 'log in'])) {
    results.push({
      type: 'getting_started',
      title: 'How to Login',
      content: sapAIKnowledge.getting_started.login.answer,
      relevance: 'high'
    });
  }

  // Check for features
  Object.entries(sapAIKnowledge.features).forEach(([key, feature]) => {
    const featureKeywords = key.split('_').concat(feature.name.toLowerCase().split(' '));
    if (matchesKeywords(normalizedQuery, featureKeywords)) {
      results.push({
        type: 'feature',
        title: feature.name,
        content: `${feature.description}\n\nCapabilities:\n${feature.capabilities.map(c => `• ${c}`).join('\n')}`,
        relevance: 'high'
      });
    }
  });

  // Check for policies
  if (matchesKeywords(normalizedQuery, ['terms', 'conditions', 'terms and conditions', 'legal'])) {
    const policy = sapAIKnowledge.policies.terms_conditions;
    results.push({
      type: 'policy',
      title: policy.title,
      content: `${policy.summary}\n\nKey Points:\n${policy.key_points.map(p => `• ${p}`).join('\n')}`,
      relevance: 'high'
    });
  }

  if (matchesKeywords(normalizedQuery, ['privacy', 'privacy policy', 'data privacy', 'personal data'])) {
    const policy = sapAIKnowledge.policies.privacy_policy;
    results.push({
      type: 'policy',
      title: policy.title,
      content: `${policy.summary}\n\nKey Points:\n${policy.key_points.map(p => `• ${p}`).join('\n')}`,
      relevance: 'high'
    });
  }

  if (matchesKeywords(normalizedQuery, ['cookie', 'cookies', 'cookie policy', 'tracking'])) {
    const policy = sapAIKnowledge.policies.cookie_policy;
    results.push({
      type: 'policy',
      title: policy.title,
      content: `${policy.summary}\n\nKey Points:\n${policy.key_points.map(p => `• ${p}`).join('\n')}`,
      relevance: 'high'
    });
  }

  if (matchesKeywords(normalizedQuery, ['refund', 'money back', 'refund policy'])) {
    const policy = sapAIKnowledge.policies.refund_policy;
    results.push({
      type: 'policy',
      title: policy.title,
      content: `${policy.summary}\n\nKey Points:\n${policy.key_points.map(p => `• ${p}`).join('\n')}`,
      relevance: 'high'
    });
  }

  if (matchesKeywords(normalizedQuery, ['acceptable use', 'rules', 'prohibited', 'allowed'])) {
    const policy = sapAIKnowledge.policies.acceptable_use;
    results.push({
      type: 'policy',
      title: policy.title,
      content: `${policy.summary}\n\nKey Points:\n${policy.key_points.map(p => `• ${p}`).join('\n')}`,
      relevance: 'high'
    });
  }

  if (matchesKeywords(normalizedQuery, ['data protection', 'security', 'safe', 'secure', 'encryption'])) {
    const policy = sapAIKnowledge.policies.data_protection;
    results.push({
      type: 'policy',
      title: policy.title,
      content: `${policy.summary}\n\nKey Points:\n${policy.key_points.map(p => `• ${p}`).join('\n')}`,
      relevance: 'high'
    });
  }

  // Check pricing
  if (matchesKeywords(normalizedQuery, ['price', 'pricing', 'cost', 'free', 'paid', 'subscription', 'how much', 'plans', 'plan'])) {
    const pricingContent = `${sapAIKnowledge.pricing.info}\n\n${sapAIKnowledge.pricing.message}\n\n**Contact Methods:**\n${sapAIKnowledge.pricing.contact_methods.map(c => `• ${c}`).join('\n')}`;
    
    results.push({
      type: 'pricing',
      title: 'Pricing Information',
      content: pricingContent,
      relevance: 'high'
    });
  }

  // Check for mobile app and SDK questions
  if (matchesKeywords(normalizedQuery, ['mobile app', 'android', 'apk', 'download app', 'install app', 'phone app', 'mobile', 'app', 'sdk', 'windows', 'desktop app', 'install', 'download'])) {
    const installFAQ = sapAIKnowledge.faqs.find(faq => faq.question.toLowerCase().includes('install'));
    const mobileAppFAQ = sapAIKnowledge.faqs.find(faq => faq.question.includes('mobile app'));
    
    // Prioritize based on query
    if (matchesKeywords(normalizedQuery, ['sdk', 'windows', 'desktop', 'install']) && installFAQ) {
      results.push({
        type: 'faq',
        title: installFAQ.question,
        content: installFAQ.answer,
        relevance: 'high'
      });
    } else if (mobileAppFAQ) {
      results.push({
        type: 'faq',
        title: mobileAppFAQ.question,
        content: mobileAppFAQ.answer,
        relevance: 'high'
      });
    }
  }

  // Search FAQs with improved keyword matching
  sapAIKnowledge.faqs.forEach(faq => {
    const questionWords = faq.question.toLowerCase().split(' ').filter(word => word.length > 3);
    const queryWords = normalizedQuery.split(' ').filter(word => word.length > 3);
    
    // Check for exact question match or strong keyword overlap
    const hasStrongMatch = queryWords.some(qWord => 
      questionWords.some(faqWord => faqWord.includes(qWord) || qWord.includes(faqWord))
    );
    
    if (normalizedQuery === faq.question.toLowerCase() ||
        faq.question.toLowerCase().includes(normalizedQuery) ||
        (normalizedQuery.length > 10 && hasStrongMatch)) {
      // Avoid duplicates
      if (!results.some(r => r.title === faq.question)) {
        results.push({
          type: 'faq',
          title: faq.question,
          content: faq.answer,
          relevance: 'medium'
        });
      }
    }
  });

  // Check for contact/support
  if (matchesKeywords(normalizedQuery, ['contact', 'support', 'help', 'email', 'reach'])) {
    results.push({
      type: 'contact',
      title: 'Contact & Support',
      content: `You can reach us at:\n• Support: ${sapAIKnowledge.contact.support_email}\n• General: ${sapAIKnowledge.contact.general_email}\n• Website: ${sapAIKnowledge.contact.website}\n\nResponse time: ${sapAIKnowledge.contact.response_time}`,
      relevance: 'high'
    });
  }

  return results;
};

/**
 * Check if query matches any of the keywords
 */
const matchesKeywords = (query, keywords) => {
  return keywords.some(keyword => query.includes(keyword.toLowerCase()));
};

/**
 * Detect if query is about other businesses or external topics
 */
const isOutOfScope = (query) => {
  const normalizedQuery = query.toLowerCase().trim();
  
  // Check for questions about other users/businesses
  const otherBusinessKeywords = [
    'other user', 'other business', 'another business', 'someone else',
    'their business', 'their data', 'other company', 'another company',
    'other people', 'their sales', 'their inventory', 'their customers',
    'his business', 'her business', 'his data', 'her data'
  ];
  
  // Check for external/unrelated topics
  const externalKeywords = [
    'weather', 'news', 'stock market', 'sports', 'movie', 'recipe',
    'wikipedia', 'google', 'facebook', 'twitter', 'instagram',
    'youtube', 'game', 'music', 'political', 'politics'
  ];
  
  const hasOtherBusinessQuery = otherBusinessKeywords.some(keyword => 
    normalizedQuery.includes(keyword)
  );
  
  const hasExternalQuery = externalKeywords.some(keyword => 
    normalizedQuery.includes(keyword)
  );
  
  return hasOtherBusinessQuery || hasExternalQuery;
};

/**
 * Generate a response based on query
 */
export const generateResponse = (query) => {
  // Check if query is out of scope
  if (isOutOfScope(query)) {
    return {
      success: false,
      message: "🚫 **Sorry, I can't help with that.**\n\nI'm the **SAP Business AI Assistant** and I can only answer questions about the SAP Business Management System.\n\n**I cannot answer questions about:**\n• Other users' business data or information\n• External businesses or companies\n• Topics outside this SAP system\n\n**I can help you with:**\n✅ SAP system features and capabilities\n✅ How to use this platform\n✅ YOUR own business data in this system\n✅ Pricing and registration information\n✅ Policies, privacy, and support\n\nPlease ask about the SAP Business Management System!",
      suggestions: [
        "What features does SAP offer?",
        "How do I manage my inventory?",
        "Tell me about pricing",
        "Is there a mobile app?"
      ]
    };
  }
  
  const results = searchKnowledge(query);

  if (results.length === 0) {
    return {
      success: false,
      message: "I couldn't find a specific answer to that question. Here are some topics I can help you with:\n\n• **System Features** - Sales, inventory, invoices, AI analytics\n• **Getting Started** - Registration, login, first steps\n• **Pricing & Plans** - Subscription options and costs\n• **Mobile App** - Android APK and web access\n• **Policies** - Privacy, terms, cookies, data protection\n• **Support** - How to contact us and get help\n\nPlease ask about any of these topics!",
      suggestions: [
        "What is SAP Business Management System?",
        "Tell me about pricing",
        "Is there a mobile app?",
        "How do I register?",
        "Contact support"
      ]
    };
  }

  // Prioritize high relevance results
  const highRelevanceResults = results.filter(r => r.relevance === 'high');
  const topResult = highRelevanceResults[0] || results[0];

  // For direct questions, return only the top result to be more focused
  const additionalResults = results.length > 1 ? results.slice(1, 2) : [];

  return {
    success: true,
    title: topResult.title,
    message: topResult.content,
    type: topResult.type,
    additionalResults: additionalResults,
    suggestions: generateSuggestions(topResult.type)
  };
};

/**
 * Generate follow-up suggestions based on response type
 */
const generateSuggestions = (type) => {
  const suggestions = {
    system: [
      "Tell me about pricing",
      "What features are available?",
      "How do I register?"
    ],
    getting_started: [
      "What can I see on the dashboard?",
      "How do I add products?",
      "Tell me about pricing"
    ],
    feature: [
      "Tell me about pricing",
      "Is there a mobile app?",
      "How do I get started?"
    ],
    policy: [
      "Is my data secure?",
      "Tell me about other policies",
      "How do I contact support?"
    ],
    pricing: [
      "What features are included?",
      "How do I register?",
      "Is there a mobile app?"
    ],
    faq: [
      "Tell me more about features",
      "Tell me about pricing",
      "How do I contact support?"
    ],
    contact: [
      "How do I register?",
      "What features do you offer?",
      "Tell me about pricing"
    ]
  };

  return suggestions[type] || [
    "What is SAP Business Management System?",
    "Tell me about pricing",
    "Is there a mobile app?"
  ];
};

export default {
  sapAIKnowledge,
  searchKnowledge,
  generateResponse
};
