import { connectDatabase, getDatabase } from '../src/db/connection.js';

/**
 * Fix company statuses - set proper status field for companies
 */
async function fixCompanyStatuses() {
  try {
    await connectDatabase();
    const db = getDatabase();

    console.log('🔧 Fixing company statuses...\n');

    // Find all companies without proper status or with inconsistent state
    const companies = await db.collection('companies').find({}).toArray();

    for (const company of companies) {
      let newStatus = company.status;
      let shouldUpdate = false;

      // If no status field or status doesn't match is_approved state
      if (!company.status) {
        if (company.is_approved) {
          newStatus = 'active';
        } else {
          newStatus = 'pending_approval';
        }
        shouldUpdate = true;
      } else if (company.status === 'active' && !company.is_approved) {
        // Inconsistent: active but not approved
        newStatus = 'pending_approval';
        shouldUpdate = true;
      }

      if (shouldUpdate) {
        await db.collection('companies').updateOne(
          { _id: company._id },
          { 
            $set: { 
              status: newStatus,
              updated_at: new Date()
            } 
          }
        );
        console.log(`✓ Updated ${company.company_name}: ${company.status || 'undefined'} → ${newStatus}`);
      } else {
        console.log(`- ${company.company_name}: ${company.status} (no change needed)`);
      }
    }

    console.log('\n✅ Status fix complete!');
    console.log('\nCurrent company statuses:');
    
    const updatedCompanies = await db.collection('companies').find({}).toArray();
    updatedCompanies.forEach(c => {
      console.log(`  - ${c.company_name}: ${c.status} (approved: ${c.is_approved})`);
    });

    process.exit(0);
  } catch (error) {
    console.error('Error fixing statuses:', error);
    process.exit(1);
  }
}

fixCompanyStatuses();
