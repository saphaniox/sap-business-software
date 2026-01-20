import { connectDatabase, getDatabase } from '../src/db/connection.js';

/**
 * Ensure all companies have consistent is_approved field
 */
async function fixApprovalFields() {
  try {
    await connectDatabase();
    const db = getDatabase();

    console.log('🔧 Fixing is_approved fields...\n');

    const companies = await db.collection('companies').find({}).toArray();

    for (const company of companies) {
      let updates = {};
      
      // Set is_approved based on status
      if (company.status === 'active' && company.is_approved !== true) {
        updates.is_approved = true;
      } else if (company.status === 'pending_approval' && company.is_approved !== false) {
        updates.is_approved = false;
      } else if (!company.hasOwnProperty('is_approved')) {
        updates.is_approved = company.status === 'active';
      }

      // Set approval_requested_at if missing for pending companies
      if (company.status === 'pending_approval' && !company.approval_requested_at) {
        updates.approval_requested_at = company.created_at || new Date();
      }

      if (Object.keys(updates).length > 0) {
        updates.updated_at = new Date();
        await db.collection('companies').updateOne(
          { _id: company._id },
          { $set: updates }
        );
        console.log(`✓ Updated ${company.company_name}:`, updates);
      } else {
        console.log(`- ${company.company_name}: No changes needed`);
      }
    }

    console.log('\n✅ Approval fields fixed!');
    console.log('\nFinal company states:');
    
    const updatedCompanies = await db.collection('companies').find({}).sort({ created_at: -1 }).toArray();
    updatedCompanies.forEach(c => {
      console.log(`\n${c.company_name}`);
      console.log(`  Email: ${c.email}`);
      console.log(`  Status: ${c.status}`);
      console.log(`  Approved: ${c.is_approved}`);
      console.log(`  Created: ${c.created_at?.toISOString() || 'N/A'}`);
      if (c.approval_requested_at) {
        console.log(`  Approval Requested: ${c.approval_requested_at.toISOString()}`);
      }
    });

    process.exit(0);
  } catch (error) {
    console.error('Error fixing approval fields:', error);
    process.exit(1);
  }
}

fixApprovalFields();
