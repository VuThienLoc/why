import mongoose from 'mongoose';
import { randomUUID } from "crypto";
import dotenv from 'dotenv';
import {
  ROLE_CODES,
  RoleCode,
} from '../../constants/roles.constant.js';
import {
  ROLE_PRIVILEGES,
} from '../../constants/privileges.constant.js';
import Role from '../models/Role.model.js';
import connectDB from '../../config/database.config.js';

dotenv.config();

// System roles with their descriptions and privileges
const rolesSeedData = [
  {
    roleCode: ROLE_CODES.ADMIN,
    roleName: 'Administrator',
    description: 'Full system access with all privileges including user and role management',
    isSystemRole: true,
    isActive: true,
    privileges: ROLE_PRIVILEGES[ROLE_CODES.ADMIN],
  },
  {
    roleCode: ROLE_CODES.MANAGER,
    roleName: 'Manager',
    description: 'Department manager with user and role management capabilities',
    isSystemRole: true,
    isActive: true,
    privileges: ROLE_PRIVILEGES[ROLE_CODES.MANAGER],
  },
  {
    roleCode: ROLE_CODES.SERVICE,
    roleName: 'Service Technician',
    description: 'Service personnel with configuration management access',
    isSystemRole: true,
    isActive: true,
    privileges: ROLE_PRIVILEGES[ROLE_CODES.SERVICE],
  },
  {
    roleCode: ROLE_CODES.LAB_USER,
    roleName: 'Laboratory User',
    description: 'Laboratory staff with test order and comment management',
    isSystemRole: true,
    isActive: true,
    privileges: ROLE_PRIVILEGES[ROLE_CODES.LAB_USER],
  },
  {
    roleCode: ROLE_CODES.USER,
    roleName: 'Regular User',
    description: 'Basic user with read-only access to test orders',
    isSystemRole: true,
    isActive: true,
    privileges: ROLE_PRIVILEGES[ROLE_CODES.USER],
  },
];

async function seedRoles() {
  try {
    await connectDB();
    console.log('Connected to database for role seeding.');

    console.log('Seeding system roles...');
    for (const roleData of rolesSeedData) {
      const existingRole = await Role.findOne({ roleCode: roleData.roleCode });
      const privileges = roleData.privileges || [];

      if (!existingRole) {
        const role = await Role.create({
          _id: randomUUID(),
          roleCode: roleData.roleCode,
          roleName: roleData.roleName,
          description: roleData.description,
          isSystemRole: roleData.isSystemRole,
          isActive: roleData.isActive,
          privileges: privileges,
        });
        console.log(`✓ Created role: ${roleData.roleCode} (${roleData.roleName}) with ${privileges.length} privileges`);
      } else {
        // Update existing role privileges to match current configuration
        existingRole.privileges = privileges;
        existingRole.roleName = roleData.roleName;
        existingRole.description = roleData.description;
        existingRole.isSystemRole = roleData.isSystemRole;
        await existingRole.save();
        console.log(`✓ Updated role: ${roleData.roleCode} (${roleData.roleName}) with ${privileges.length} privileges`);
      }
    }

    console.log('\n✅ Role seeding completed successfully!');
    console.log('\nRole Summary:');
    const roles = await Role.find({ isSystemRole: true });
    roles.forEach(role => {
      console.log(`  - ${role.roleCode}: ${role.privileges.length} privileges`);
    });
  } catch (error) {
    console.error('❌ Error seeding roles:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\nDatabase connection closed.');
  }
}

seedRoles();
