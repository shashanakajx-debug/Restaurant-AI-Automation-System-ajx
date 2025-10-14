import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import dbConnect from '../src/lib/mongoose';  // Ensure this is the correct path
import User from '../src/models/User';  // Ensure this is the correct path

async function createAdminUser() {
  try {
    console.log('Connecting to database...');
    await dbConnect();  // Ensure your MongoDB connection is working
    
    // Default email and password, you can also use environment variables
    const email = process.env.ADMIN_EMAIL || 'dev.admin@example.com';  // Use env var if available
    const password = process.env.ADMIN_PASSWORD || 'admin123';  // Plain text password, will be hashed
    
    console.log(`Checking for admin user with email: ${email}`);
    let user = await User.findOne({ email });
    
    if (user) {
      // Admin user exists, update details if needed
      console.log('Admin user already exists, updating role and ensuring account is active');
      user.role = 'admin';
      user.isActive = true;
      user.emailVerified = true;
      
      // We don't hash the password if the user already exists, because the password is already hashed in the database.
      await user.save();
      console.log('Admin user updated successfully');
    } else {
      // Admin user does not exist, create a new admin user
      console.log('Admin user does not exist, creating new admin user');
      const salt = await bcrypt.genSalt(12);
      const hashedPassword = await bcrypt.hash(password, salt);  // Hash the password

      // Create a new user in the database with the hashed password
      user = await User.create({
        email,
        password: hashedPassword,  // Store hashed password
        name: 'Admin User',
        role: 'admin',
        isActive: true,
        emailVerified: true,
        lastLogin: new Date()
      });
      console.log('Admin user created successfully');
    }
    
    // Log the details of the created or updated user (for dev purposes, do not log sensitive data in production)
    console.log('Admin user details:');
    console.log(`- Email: ${email}`);
    console.log(`- Role: ${user.role}`);
    console.log(`- Account Active: ${user.isActive}`);
    
    return { success: true, user };
  } catch (error) {
    console.error('Error creating admin user:', error);
    return { success: false, error };
  } finally {
    // Close the MongoDB connection
    if (mongoose.connection.readyState === 1) {
      console.log('Closing database connection');
      await mongoose.connection.close();
    }
  }
}

// Only run if this file is executed directly (not imported)
if (require.main === module) {
  createAdminUser()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Unhandled error:', error);
      process.exit(1);
    });
}

export default createAdminUser;
