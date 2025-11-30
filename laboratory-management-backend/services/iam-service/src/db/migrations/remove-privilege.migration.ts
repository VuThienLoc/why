import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Role from '../models/Role.model.js';
import connectDB from '../../config/database.config.js';

dotenv.config();

/**
 * Migration script to safely remove a privilege from all roles
 * 
 * Usage:
 * 1. Update the PRIVILEGE_TO_REMOVE constant with the privilege code you want to remove
 * 2. Run: tsx src/db/migrations/remove-privilege.migration.ts
 */

// ⚠️ UPDATE THIS: Specify the privilege code to remove
const PRIVILEGE_TO_REMOVE = 'manage:user_status';

async function removePrivilege() {
  try {
    await connectDB();
    console.log('Connected to database for privilege removal migration.');
    console.log(`\nRemoving privilege: "${PRIVILEGE_TO_REMOVE}"\n`);

    // Find all roles that have this privilege
    const rolesWithPrivilege = await Role.find({
      privileges: PRIVILEGE_TO_REMOVE
    });

    if (rolesWithPrivilege.length === 0) {
      console.log('✅ No roles found with this privilege. Nothing to remove.');
      return;
    }

    console.log(`Found ${rolesWithPrivilege.length} role(s) with this privilege:`);
    rolesWithPrivilege.forEach(role => {
      console.log(`  - ${role.roleCode} (${role.roleName})`);
    });

    // Remove the privilege from all roles
    const result = await Role.updateMany(
      { privileges: PRIVILEGE_TO_REMOVE },
      { $pull: { privileges: PRIVILEGE_TO_REMOVE } }
    );

    console.log(`\n✅ Migration completed successfully!`);
    console.log(`   Modified ${result.modifiedCount} role(s)`);

    // Verify the removal
    const remainingRoles = await Role.find({
      privileges: PRIVILEGE_TO_REMOVE
    });

    if (remainingRoles.length === 0) {
      console.log(`\n✓ Verified: No roles have "${PRIVILEGE_TO_REMOVE}" privilege anymore`);
    } else {
      console.warn(`\n⚠️  Warning: ${remainingRoles.length} role(s) still have this privilege`);
    }

  } catch (error) {
    console.error('❌ Error during migration:', error);
    throw error;
  } finally {
    await mongoose.connection.close();
    console.log('\nDatabase connection closed.');
  }
}

removePrivilege();
