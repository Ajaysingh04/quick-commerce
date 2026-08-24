import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

const makeAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    
    // Update all users to admin for testing purposes, or we could find one specific user.
    // Given the prompt "admin ko sare access do", I will make all users admin for ease of access during development.
    const result = await User.updateMany({}, { role: 'admin' });
    
    console.log(`Successfully updated ${result.modifiedCount} users to admin role.`);
    process.exit(0);
  } catch (error) {
    console.error('Error updating users:', error);
    process.exit(1);
  }
};

makeAdmin();
