import dotenv from 'dotenv';
import mongoose from 'mongoose';
import connectDB from './config/db.js';
import Employee from './models/Employee.js';
import Project from './models/Project.js';

dotenv.config();

const seedData = async () => {
  try {
    await connectDB();

    console.log('[Seed] Checking existing data...');

    // Seed Admin User
    let admin = await Employee.findOne({ email: 'admin@ems.com' });
    if (!admin) {
      admin = await Employee.create({
        name: 'System Admin',
        email: 'admin@ems.com',
        password: 'AdminPass123!',
        role: 'admin',
        department: 'Management',
        designation: 'System Administrator',
        phone: '+1 555-0100',
        status: 'active'
      });
      console.log('[Seed] Admin user created: admin@ems.com / AdminPass123!');
    } else {
      console.log('[Seed] Admin user already exists.');
    }

    // Seed Sample Employee 1
    let emp1 = await Employee.findOne({ email: 'john@ems.com' });
    if (!emp1) {
      emp1 = await Employee.create({
        name: 'John Doe',
        email: 'john@ems.com',
        password: 'UserPass123!',
        role: 'employee',
        department: 'Engineering',
        designation: 'Senior Full Stack Developer',
        phone: '+1 555-0101',
        status: 'active'
      });
      console.log('[Seed] Sample employee 1 created: john@ems.com / UserPass123!');
    }

    // Seed Sample Employee 2
    let emp2 = await Employee.findOne({ email: 'sarah@ems.com' });
    if (!emp2) {
      emp2 = await Employee.create({
        name: 'Sarah Jenkins',
        email: 'sarah@ems.com',
        password: 'UserPass123!',
        role: 'employee',
        department: 'Design',
        designation: 'Lead UI/UX Designer',
        phone: '+1 555-0102',
        status: 'active'
      });
      console.log('[Seed] Sample employee 2 created: sarah@ems.com / UserPass123!');
    }

    // Seed Sample Projects if none exist
    const projectCount = await Project.countDocuments();
    if (projectCount === 0) {
      await Project.create([
        {
          title: 'Enterprise ERP Modernization',
          description: 'Migrating legacy monolith application to modern microservices & React web dashboard.',
          clientName: 'Acme Global Corp',
          startDate: new Date('2026-01-15'),
          endDate: new Date('2026-08-30'),
          status: 'in-progress',
          priority: 'high',
          budget: 150000,
          assignedEmployees: [emp1._id, emp2._id],
          createdBy: admin._id
        },
        {
          title: 'Mobile Banking Portal Redesign',
          description: 'Next-generation responsive client interface for mobile banking with biometrics.',
          clientName: 'Apex Financial',
          startDate: new Date('2026-03-01'),
          endDate: new Date('2026-11-15'),
          status: 'planning',
          priority: 'urgent',
          budget: 220000,
          assignedEmployees: [emp2._id],
          createdBy: admin._id
        }
      ]);
      console.log('[Seed] Created sample projects.');
    }

    console.log('[Seed] Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error(`[Seed Error] ${error.message}`);
    process.exit(1);
  }
};

seedData();
