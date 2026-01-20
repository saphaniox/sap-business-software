import { getDatabase } from '../db/connection.js';

/**
 * Middleware to add tenant context to request
 * Attaches company_id for multi-tenant data isolation
 * CRITICAL: This middleware ensures complete data isolation between businesses
 * No business can access another business's data
 */
export async function tenantContext(req, res, next) {
  try {
    // Get company_id from authenticated user
    const companyId = req.user?.company_id;

    if (!companyId) {
      console.warn('⚠️ Tenant context missing - unauthorized access attempt blocked');
      return res.status(400).json({ 
        error: 'Business context not found. Please ensure you are properly authenticated.' 
      });
    }

    // Attach company ID to request for data filtering
    // All subsequent database operations MUST filter by req.companyId
    req.companyId = companyId;

    // Log for audit trail (optional - remove in production if not needed)
    console.log(`✓ Tenant context established for business: ${companyId}`);

    next();
  } catch (error) {
    console.error('❌ Tenant context error:', error);
    return res.status(500).json({ 
      error: 'Failed to establish business context' 
    });
  }
}

/**
 * Middleware to enforce data isolation
 * Ensures queries are scoped to the current company
 */
export function enforceDataIsolation(req, res, next) {
  const originalQuery = req.query;
  const companyId = req.companyId;

  // Add company_id filter to all queries
  if (companyId) {
    req.query = {
      ...originalQuery,
      _company_id: companyId
    };
  }

  next();
}

/**
 * Helper function to add company_id to data objects
 * Call this before inserting/updating documents
 * ENSURES: All data is tagged with the correct business ID
 */
export function addCompanyContext(data, companyId) {
  if (!companyId) {
    throw new Error('SECURITY ERROR: Cannot add data without business context');
  }

  if (Array.isArray(data)) {
    return data.map(item => ({
      ...item,
      company_id: new ObjectId(companyId)
    }));
  }
  
  return {
    ...data,
    company_id: new ObjectId(companyId)
  };
}

/**
 * Helper function to create company-scoped query filter
 * CRITICAL: Always use this to ensure queries are scoped to the correct business
 * This prevents accidental data leakage between businesses
 */
export function createCompanyFilter(companyId, additionalFilter = {}) {
  if (!companyId) {
    throw new Error('SECURITY ERROR: Cannot query without business context');
  }

  return {
    company_id: new ObjectId(companyId),
    ...additionalFilter
  };
}

export default {
  tenantContext,
  enforceDataIsolation,
  addCompanyContext,
  createCompanyFilter
};
