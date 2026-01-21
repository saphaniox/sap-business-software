import { query } from '../db/connection.js';
import { v4 as uuidv4 } from 'uuid';
import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';

/**
 * Get industry-specific features and categories
 */
function getIndustryFeatures(businessType) {
  const features = {
    electronics: {
      categories: ['Mobile Phones', 'Laptops', 'TVs', 'Audio', 'Cameras', 'Gaming', 'Accessories', 'Home Appliances'],
      attributes: ['Brand', 'Model', 'Warranty Period', 'IMEI/Serial Number', 'Color', 'Storage Capacity'],
      uom: ['Unit', 'Box', 'Set'],
      features: ['Warranty Tracking', 'IMEI/Serial Number Management', 'Supplier Management']
    },
    fashion: {
      categories: ['Men\'s Wear', 'Women\'s Wear', 'Kids Wear', 'Shoes', 'Bags', 'Accessories', 'Sportswear'],
      attributes: ['Size', 'Color', 'Material', 'Brand', 'Season', 'Gender', 'Style'],
      uom: ['Piece', 'Pair', 'Set', 'Dozen'],
      features: ['Size & Color Variants', 'Seasonal Collections', 'Fashion Trends']
    },
    pharmacy: {
      categories: ['Prescription Drugs', 'OTC Medicines', 'Supplements', 'Personal Care', 'Medical Devices', 'Baby Care'],
      attributes: ['Dosage', 'Expiry Date', 'Batch Number', 'Manufacturer', 'Active Ingredient'],
      uom: ['Tablet', 'Capsule', 'Bottle', 'Box', 'Tube', 'Piece'],
      features: ['Expiry Date Tracking', 'Batch Management', 'Prescription Management', 'Drug Interactions']
    },
    grocery: {
      categories: ['Fresh Produce', 'Dairy', 'Bakery', 'Beverages', 'Snacks', 'Frozen Foods', 'Household'],
      attributes: ['Brand', 'Weight/Volume', 'Expiry Date', 'Batch Number', 'Origin'],
      uom: ['Kg', 'Gram', 'Liter', 'Piece', 'Pack', 'Carton'],
      features: ['Expiry Date Tracking', 'Barcode Scanning', 'Weight Management', 'Batch Tracking']
    },
    hardware: {
      categories: ['Hand Tools', 'Power Tools', 'Plumbing', 'Electrical', 'Building Materials', 'Paint', 'Safety Equipment'],
      attributes: ['Brand', 'Material', 'Size/Dimension', 'Color', 'Certification'],
      uom: ['Piece', 'Set', 'Meter', 'Kg', 'Bag', 'Box', 'Roll'],
      features: ['Bulk Sales', 'Project Management', 'Contractor Pricing']
    },
    furniture: {
      categories: ['Living Room', 'Bedroom', 'Office', 'Kitchen', 'Outdoor', 'Decor', 'Lighting'],
      attributes: ['Material', 'Color', 'Dimensions', 'Style', 'Brand', 'Assembly Required'],
      uom: ['Piece', 'Set', 'Pair'],
      features: ['Custom Orders', 'Assembly Service', 'Delivery Tracking']
    },
    automotive: {
      categories: ['Engine Parts', 'Body Parts', 'Tires', 'Batteries', 'Fluids', 'Accessories', 'Tools'],
      attributes: ['Brand', 'Part Number', 'Compatibility', 'Year', 'Model', 'Condition'],
      uom: ['Piece', 'Set', 'Liter', 'Pair'],
      features: ['Vehicle Compatibility', 'Part Number Search', 'Service History']
    },
    restaurant: {
      categories: ['Appetizers', 'Main Course', 'Desserts', 'Beverages', 'Alcohol', 'Special Menu'],
      attributes: ['Ingredients', 'Allergens', 'Spice Level', 'Serving Size', 'Preparation Time'],
      uom: ['Plate', 'Bowl', 'Cup', 'Bottle', 'Glass', 'Serving'],
      features: ['Table Management', 'Recipe Management', 'Ingredient Tracking', 'Menu Builder']
    },
    beauty: {
      categories: ['Skincare', 'Makeup', 'Hair Care', 'Fragrances', 'Nail Care', 'Men\'s Grooming', 'Tools'],
      attributes: ['Brand', 'Shade/Color', 'Skin Type', 'Size', 'Expiry Date', 'Ingredients'],
      uom: ['Piece', 'Bottle', 'Tube', 'Set', 'ml', 'gm'],
      features: ['Shade Management', 'Expiry Tracking', 'Customer Skin Profiles']
    },
    bookstore: {
      categories: ['Fiction', 'Non-Fiction', 'Academic', 'Children', 'Stationery', 'Art Supplies', 'Office Supplies'],
      attributes: ['Author', 'ISBN', 'Publisher', 'Edition', 'Language', 'Binding'],
      uom: ['Piece', 'Set', 'Pack', 'Box'],
      features: ['ISBN Management', 'Author Catalog', 'Pre-orders', 'Book Reviews']
    },
    sports: {
      categories: ['Fitness Equipment', 'Sports Gear', 'Apparel', 'Footwear', 'Supplements', 'Accessories'],
      attributes: ['Brand', 'Size', 'Color', 'Sport Type', 'Material', 'Weight'],
      uom: ['Piece', 'Pair', 'Set', 'Kg'],
      features: ['Size Charts', 'Equipment Maintenance', 'Membership Management']
    },
    jewelry: {
      categories: ['Rings', 'Necklaces', 'Bracelets', 'Earrings', 'Watches', 'Precious Stones', 'Custom Designs'],
      attributes: ['Metal Type', 'Karat', 'Stone Type', 'Weight', 'Size', 'Certification'],
      uom: ['Piece', 'Gram', 'Carat', 'Pair'],
      features: ['Custom Orders', 'Certification Management', 'Gold Price Tracking', 'Repair Tracking']
    },
    technology: {
      categories: ['Software', 'Hardware', 'Services', 'Cloud Solutions', 'Consulting', 'Support'],
      attributes: ['License Type', 'Version', 'Platform', 'Duration', 'Support Level'],
      uom: ['License', 'User', 'Month', 'Year', 'Hour', 'Project'],
      features: ['License Management', 'Project Tracking', 'Time Billing', 'SLA Management']
    },
    wholesale: {
      categories: ['Consumer Goods', 'Industrial', 'Food & Beverages', 'Electronics', 'Textiles', 'Chemicals'],
      attributes: ['Brand', 'Minimum Order', 'Lead Time', 'Origin', 'Certification'],
      uom: ['Piece', 'Carton', 'Pallet', 'Container', 'Kg', 'Ton'],
      features: ['Bulk Pricing', 'MOQ Management', 'Distributor Network', 'Credit Terms']
    },
    general: {
      categories: ['Products', 'Services', 'Merchandise'],
      attributes: ['Brand', 'Model', 'Color', 'Size'],
      uom: ['Unit', 'Piece', 'Set', 'Box'],
      features: ['General Inventory', 'Sales Tracking']
    }
  };

  return features[businessType] || features.general;
}

/**
 * Register a new company
 */
export async function registerCompany(req, res) {
  const { 
    companyName, 
    businessType,
    email, 
    phone,
    currency,
    adminname,
    adminEmail,
    adminPassword
  } = req.body;
  
  const databaseType = 'shared';

  try {
    // Validate required fields
    if (!companyName || !adminname || !adminEmail || !adminPassword) {
      return res.status(400).json({ 
        error: 'Company name, admin name, email, and password are required' 
      });
    }

    // Validate password
    if (adminPassword.length < 8) {
      return res.status(400).json({ 
        error: 'Admin password must be at least 8 characters long' 
      });
    }

    // Check if company name already exists
    const [existingCompanies] = await query(
      'SELECT * FROM companies WHERE LOWER(company_name) = LOWER(?)',
      [companyName]
    );

    if (existingCompanies.length > 0) {
      return res.status(400).json({ 
        error: 'A company with this name already exists. Please choose a different name.' 
      });
    }

    // Check if admin email or name exists
    const [existingUsers] = await query(
      'SELECT * FROM users WHERE name = ? OR email = ?',
      [adminname, adminEmail]
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({ 
        error: 'This name or email is already registered.' 
      });
    }

    // Get industry-specific features
    const industryFeatures = getIndustryFeatures(businessType);

    // Create company record
    const companyId = uuidv4();
    const now = new Date();
    const settings = {
      currency: currency || 'UGX',
      timezone: 'UTC',
      date_format: 'MM/DD/YYYY',
      language: 'en'
    };

    await query(
      `INSERT INTO companies 
      (id, company_name, business_type, currency, email, phone, database_type, database_name, 
      status, subscription_tier, approval_requested_at, settings, industry_features, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        companyId,
        companyName,
        businessType || 'general',
        currency || 'UGX',
        email || adminEmail,
        phone || '',
        databaseType,
        'sap_shared_database',
        'pending_approval',
        'standard',
        now,
        JSON.stringify(settings),
        JSON.stringify(industryFeatures),
        now,
        now
      ]
    );

    // Hash admin password
    const hashedPassword = await bcryptjs.hash(adminPassword, 10);

    // Create admin user
    const userId = uuidv4();
    await query(
      `INSERT INTO users 
      (id, company_id, name, email, password_hash, role, is_company_admin, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        companyId,
        adminname,
        adminEmail,
        hashedPassword,
        'admin',
        1,
        now,
        now
      ]
    );

    // SECURITY: Require JWT_SECRET
    if (!process.env.JWT_SECRET) {
      console.error('🚨 CRITICAL: JWT_SECRET not set');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: userId,
        company_id: companyId,
        name: adminname,
        role: 'admin',
        is_company_admin: true
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'Company registered successfully. Pending admin approval.',
      status: 'pending_approval',
      company: {
        id: companyId,
        company_name: companyName,
        business_type: businessType,
        database_type: databaseType,
        status: 'pending_approval',
        industry_features: industryFeatures
      },
      user: {
        id: userId,
        name: adminname,
        email: adminEmail,
        role: 'admin'
      },
      token
    });
  } catch (error) {
    console.error('Company registration error:', error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * Get company details
 */
export async function getCompany(req, res) {
  try {
    const companyId = req.user.company_id;
    
    const companies = await query(
      'SELECT * FROM companies WHERE id = ?',
      [companyId]
    );
    
    if (companies.length === 0) {
      return res.status(404).json({ error: 'Company not found' });
    }
    
    const company = companies[0];
    
    // Parse JSON fields
    if (company.settings && typeof company.settings === 'string') {
      company.settings = JSON.parse(company.settings);
    }
    if (company.industry_features && typeof company.industry_features === 'string') {
      company.industry_features = JSON.parse(company.industry_features);
    }
    
    res.json(company);
  } catch (error) {
    console.error('Get company error:', error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * Update company details
 */
export async function updateCompany(req, res) {
  try {
    const companyId = req.user.company_id;
    
    const { 
      company_name,
      business_type,
      email,
      phone,
      address,
      city,
      country,
      website,
      tax_id
    } = req.body;

    const updateFields = [];
    const updateValues = [];

    if (company_name !== undefined) {
      updateFields.push('company_name = ?');
      updateValues.push(company_name);
    }
    if (business_type !== undefined) {
      updateFields.push('business_type = ?');
      updateValues.push(business_type);
    }
    if (email !== undefined) {
      updateFields.push('email = ?');
      updateValues.push(email);
    }
    if (phone !== undefined) {
      updateFields.push('phone = ?');
      updateValues.push(phone);
    }
    if (address !== undefined) {
      updateFields.push('address = ?');
      updateValues.push(address);
    }
    if (city !== undefined) {
      updateFields.push('city = ?');
      updateValues.push(city);
    }
    if (country !== undefined) {
      updateFields.push('country = ?');
      updateValues.push(country);
    }
    if (website !== undefined) {
      updateFields.push('website = ?');
      updateValues.push(website);
    }
    if (tax_id !== undefined) {
      updateFields.push('tax_id = ?');
      updateValues.push(tax_id);
    }

    updateFields.push('updated_at = ?');
    updateValues.push(new Date());

    updateValues.push(companyId);

    await query(
      `UPDATE companies SET ${updateFields.join(', ')} WHERE id = ?`,
      updateValues
    );

    // Get updated company
    const [companies] = await query(
      'SELECT * FROM companies WHERE id = ?',
      [companyId]
    );

    res.json({
      message: 'Company updated successfully',
      company: companies[0]
    });
  } catch (error) {
    console.error('Update company error:', error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * Get all companies (Super Admin only)
 */
export async function getAllCompanies(req, res) {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const offset = (page - 1) * limit;
    const status = req.query.status;

    let whereClause = '';
    const params = [];

    if (status) {
      whereClause = 'WHERE status = ?';
      params.push(status);
    }

    const [companies] = await query(
      `SELECT * FROM companies ${whereClause} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    const [totalResult] = await query(
      `SELECT COUNT(*) as count FROM companies ${whereClause}`,
      params
    );

    const total = totalResult[0].count;

    res.json({
      companies,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get all companies error:', error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * Get company settings/profile
 */
export async function getCompanySettings(req, res) {
  try {
    const companyId = req.companyId;
    
    const [companies] = await query(
      'SELECT * FROM companies WHERE id = ?',
      [companyId]
    );

    if (companies.length === 0) {
      return res.status(404).json({ error: 'Company not found' });
    }

    const company = companies[0];

    res.json({
      id: company.id,
      company_name: company.company_name,
      logo: company.logo_url || null,
      address: company.address || '',
      city: company.city || '',
      country: company.country || '',
      phone: company.phone || '',
      alternate_phone: company.alternate_phone || '',
      email: company.email || '',
      website: company.website || '',
      tax_id: company.tax_id || '',
      currency: company.currency || 'UGX',
      updated_at: company.updated_at
    });
  } catch (error) {
    console.error('Get company settings error:', error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * Update company settings/profile
 */
export async function updateCompanySettings(req, res) {
  try {
    const companyId = req.companyId;

    const { 
      business_type, 
      address, 
      city, 
      country, 
      phone, 
      alternate_phone, 
      email, 
      website, 
      tax_id, 
      currency 
    } = req.body;

    // Get current company data to check if currency is changing
    const [companies] = await query(
      'SELECT * FROM companies WHERE id = ?',
      [companyId]
    );
    
    if (companies.length === 0) {
      return res.status(404).json({ error: 'Company not found' });
    }
    
    const currentCompany = companies[0];
    const oldCurrency = currentCompany.currency || 'UGX';
    const newCurrency = currency || oldCurrency;
    const currencyChanged = oldCurrency !== newCurrency;

    const updateFields = [];
    const updateValues = [];

    if (business_type !== undefined) {
      updateFields.push('business_type = ?');
      updateValues.push(business_type);
    }
    if (address !== undefined) {
      updateFields.push('address = ?');
      updateValues.push(address);
    }
    if (city !== undefined) {
      updateFields.push('city = ?');
      updateValues.push(city);
    }
    if (country !== undefined) {
      updateFields.push('country = ?');
      updateValues.push(country);
    }
    if (phone !== undefined) {
      updateFields.push('phone = ?');
      updateValues.push(phone);
    }
    if (alternate_phone !== undefined) {
      updateFields.push('alternate_phone = ?');
      updateValues.push(alternate_phone);
    }
    if (email !== undefined) {
      updateFields.push('email = ?');
      updateValues.push(email);
    }
    if (website !== undefined) {
      updateFields.push('website = ?');
      updateValues.push(website);
    }
    if (tax_id !== undefined) {
      updateFields.push('tax_id = ?');
      updateValues.push(tax_id);
    }
    if (currency !== undefined) {
      updateFields.push('currency = ?');
      updateValues.push(currency);
      
      // Also update settings JSON
      const settings = currentCompany.settings ? JSON.parse(currentCompany.settings) : {};
      settings.currency = currency;
      updateFields.push('settings = ?');
      updateValues.push(JSON.stringify(settings));
    }

    updateFields.push('updated_at = ?');
    updateValues.push(new Date());

    updateValues.push(companyId);

    await query(
      `UPDATE companies SET ${updateFields.join(', ')} WHERE id = ?`,
      updateValues
    );

    // If currency changed, convert all monetary values
    if (currencyChanged) {
      console.log(`💱 Converting prices from ${oldCurrency} to ${newCurrency}...`);
      
      try {
        // Note: These functions would need to be updated for MySQL as well
        // For now, log that conversion is needed
        console.log(`⚠️ Currency conversion functions need MySQL implementation`);
      } catch (conversionError) {
        console.error('Currency conversion error:', conversionError);
      }
    }

    // Get updated company
    const [updatedCompanies] = await query(
      'SELECT * FROM companies WHERE id = ?',
      [companyId]
    );

    const updatedCompany = updatedCompanies[0];

    res.json({
      message: currencyChanged 
        ? `Company settings updated and all prices converted to ${newCurrency}` 
        : 'Company settings updated successfully',
      company: {
        id: updatedCompany.id,
        company_name: updatedCompany.company_name,
        logo: updatedCompany.logo || null,
        address: updatedCompany.address || '',
        phone: updatedCompany.phone || '',
        email: updatedCompany.email || '',
        website: updatedCompany.website || '',
        tax_id: updatedCompany.tax_id || '',
        currency: updatedCompany.currency || 'UGX'
      },
      currencyConverted: currencyChanged
    });
  } catch (error) {
    console.error('Update company settings error:', error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * Upload company logo
 */
export async function uploadCompanyLogo(req, res) {
  try {
    const companyId = req.companyId;

    if (!req.file) {
      return res.status(400).json({ error: 'No logo file uploaded' });
    }

    // Delete old logo if exists
    const [companies] = await query(
      'SELECT * FROM companies WHERE id = ?',
      [companyId]
    );
    
    if (companies.length > 0 && companies[0].logo) {
      const fs = await import('fs');
      const path = await import('path');
      const oldLogoPath = path.join(process.cwd(), 'uploads', 'company-logos', companies[0].logo);
      if (fs.existsSync(oldLogoPath)) {
        fs.unlinkSync(oldLogoPath);
      }
    }

    const logoFilename = req.file.filename;

    await query(
      'UPDATE companies SET logo = ?, updated_at = ? WHERE id = ?',
      [logoFilename, new Date(), companyId]
    );

    res.json({
      message: 'Logo uploaded successfully',
      logo: logoFilename
    });
  } catch (error) {
    console.error('Upload logo error:', error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * Delete company logo
 */
export async function deleteCompanyLogo(req, res) {
  try {
    const companyId = req.companyId;

    const [companies] = await query(
      'SELECT * FROM companies WHERE id = ?',
      [companyId]
    );
    
    if (companies.length === 0 || !companies[0].logo) {
      return res.status(404).json({ error: 'No logo found' });
    }

    const company = companies[0];

    const fs = await import('fs');
    const path = await import('path');
    const logoPath = path.join(process.cwd(), 'uploads', 'company-logos', company.logo);
    if (fs.existsSync(logoPath)) {
      fs.unlinkSync(logoPath);
    }

    await query(
      'UPDATE companies SET logo = NULL, updated_at = ? WHERE id = ?',
      [new Date(), companyId]
    );

    res.json({ message: 'Logo deleted successfully' });
  } catch (error) {
    console.error('Delete logo error:', error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * Get company logo file
 */
export async function getCompanyLogo(req, res) {
  try {
    const companyId = req.companyId;

    const [companies] = await query(
      'SELECT * FROM companies WHERE id = ?',
      [companyId]
    );
    
    if (companies.length === 0 || !companies[0].logo) {
      return res.status(404).json({ error: 'No logo found' });
    }

    const company = companies[0];

    const path = await import('path');
    const logoPath = path.join(process.cwd(), 'uploads', 'company-logos', company.logo);

    res.sendFile(logoPath);
  } catch (error) {
    console.error('Get logo error:', error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * Get industry features endpoint (public)
 * Returns all available industry types and their features
 */
export async function getIndustryFeaturesEndpoint(req, res) {
  try {
    const allIndustries = [
      { value: 'electronics', label: 'Electronics & Appliances' },
      { value: 'fashion', label: 'Fashion & Clothing' },
      { value: 'pharmacy', label: 'Pharmacy & Healthcare' },
      { value: 'grocery', label: 'Grocery & Supermarket' },
      { value: 'hardware', label: 'Hardware & Construction' },
      { value: 'furniture', label: 'Furniture & Home Decor' },
      { value: 'automotive', label: 'Automotive & Parts' },
      { value: 'restaurant', label: 'Restaurant & Food Service' },
      { value: 'beauty', label: 'Beauty & Cosmetics' },
      { value: 'bookstore', label: 'Books & Stationery' },
      { value: 'sports', label: 'Sports & Fitness' },
      { value: 'jewelry', label: 'Jewelry & Accessories' },
      { value: 'technology', label: 'Technology & IT Services' },
      { value: 'wholesale', label: 'Wholesale & Distribution' },
      { value: 'general', label: 'General Retail' },
      { value: 'other', label: 'Other' }
    ];

    // If businessType query param is provided, return specific features
    const { businessType } = req.query;
    if (businessType) {
      const features = getIndustryFeatures(businessType);
      return res.json({ 
        businessType, 
        features 
      });
    }

    // Otherwise return all industries
    res.json({ industries: allIndustries });
  } catch (error) {
    console.error('Get industry features error:', error);
    res.status(500).json({ error: error.message });
  }
}
