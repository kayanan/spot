import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { UserDTO } from '../modules/user/data/dtos/user.dto';
import { RoleDTO } from '../modules/user/data/dtos/role.dto';

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/findMySpot');
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Create test user
const createTestUser = async () => {
  try {
    // First, get or create a USER role
    let userRole = await RoleDTO.findOne({ type: 'USER' });
    if (!userRole) {
      userRole = await RoleDTO.create({
        type: 'USER',
        description: 'Regular user role'
      });
      console.log('Created USER role');
    }

    // Check if test user already exists
    const existingUser = await UserDTO.findOne({ email: 'test@example.com' });
    if (existingUser) {
      console.log('Test user already exists');
      return;
    }

    // Create test user
    const testUser = await UserDTO.create({
      firstName: 'Test',
      lastName: 'User',
      email: 'test@example.com',
      password: 'Test123!',
      phoneNumber: '0712345678',
      nic: '123456789V',
      role: [userRole._id],
      isActive: true,
      approvalStatus: true,
      isDeleted: false
    });

    console.log('Test user created successfully:', {
      id: testUser._id,
      email: testUser.email,
      firstName: testUser.firstName,
      lastName: testUser.lastName
    });

  } catch (error) {
    console.error('Error creating test user:', error);
  }
};

// Run the script
const run = async () => {
  await connectDB();
  await createTestUser();
  await mongoose.disconnect();
  console.log('Script completed');
};

run(); 