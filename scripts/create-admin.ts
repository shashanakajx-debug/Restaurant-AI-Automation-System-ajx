// scripts/create-admin.ts
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import * as readline from 'readline';

// Dynamically import based on your project structure
async function importDependencies() {
  try {
    // Try src structure first
    const dbConnect = (await import('../src/lib/mongoose')).default;
    const User = (await import('../src/models/User')).default;
    return { dbConnect, User };
  } catch {
    // Fallback to lib structure
    const dbConnect = (await import('@/lib/mongoose')).default;
    const User = (await import('@/models/User')).default;
    return { dbConnect, User };
  }
}

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(query, resolve);
  });
}

async function createAdminUser(options?: {
  email?: string;
  password?: string;
  name?: string;
  interactive?: boolean;
}) {
  const { dbConnect, User } = await importDependencies();
  
  try {
    console.log('🔌 Connecting to database...');
    await dbConnect();
    console.log('✅ Connected to database\n');
    
    let email: string;
    let password: string;
    let name: string;
    
    if (options?.interactive) {
      // Interactive mode
      console.log('📝 Create Admin User (Interactive Mode)\n');
      email = await question('Email: ');
      password = await question('Password (min 6 chars): ');
      name = await question('Name: ');
      
      if (!email || !password || password.length < 6 || !name) {
        throw new Error('Invalid input. Email, name, and password (min 6 chars) are required.');
      }
    } else {
      // Environment variables or defaults
      email = options?.email || process.env.ADMIN_EMAIL || 'admin@example.com';
      password = options?.password || process.env.ADMIN_PASSWORD || 'admin123';
      name = options?.name || 'Admin User';
    }
    
    console.log(`\n🔍 Checking for existing user: ${email}`);
    let user = await User.findOne({ email });
    
    if (user) {
      console.log('⚠️  User already exists!');
      
      const shouldUpdate = options?.interactive 
        ? (await question('Update to admin role? (y/n): ')).toLowerCase() === 'y'
        : true;
      
      if (shouldUpdate) {
        user.role = 'admin';
        user.isActive = true;
        user.emailVerified = true;
        user.name = name;
        
        // Update password if provided
        if (password && options?.interactive) {
          const salt = await bcrypt.genSalt(12);
          user.password = await bcrypt.hash(password, salt);
          console.log('🔐 Password updated');
        }
        
        await user.save();
        console.log('✅ Admin user updated successfully');
      } else {
        console.log('❌ Update cancelled');
        return { success: false, message: 'Update cancelled by user' };
      }
    } else {
      console.log('👤 Creating new admin user...');
      
      const salt = await bcrypt.genSalt(12);
      const hashedPassword = await bcrypt.hash(password, salt);

      user = await User.create({
        email,
        password: hashedPassword,
        name,
        role: 'admin',
        isActive: true,
        emailVerified: true,
        lastLogin: new Date()
      });
      
      console.log('✅ Admin user created successfully');
    }
    
    // Display user details
    console.log('\n📋 Admin User Details:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📧 Email:    ${email}`);
    console.log(`👤 Name:     ${user.name}`);
    console.log(`🔑 Role:     ${user.role}`);
    console.log(`✓  Active:   ${user.isActive}`);
    console.log(`✓  Verified: ${user.emailVerified}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    if (!options?.interactive) {
      console.log('💡 Login Credentials:');
      console.log(`   Email:    ${email}`);
      console.log(`   Password: ${password}`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    }
    
    return { success: true, user };
  } catch (error) {
    console.error('\n❌ Error:', error instanceof Error ? error.message : error);
    return { success: false, error };
  } finally {
    // Close readline interface
    rl.close();
    
    // Close database connection
    if (mongoose.connection.readyState === 1) {
      console.log('🔌 Closing database connection...');
      await mongoose.connection.close();
      console.log('✅ Database connection closed\n');
    }
  }
}

// Parse command line arguments
function parseArgs() {
  const args = process.argv.slice(2);
  const options: any = { interactive: false };
  
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    switch (arg) {
      case '--email':
      case '-e':
        options.email = args[++i];
        break;
      case '--password':
      case '-p':
        options.password = args[++i];
        break;
      case '--name':
      case '-n':
        options.name = args[++i];
        break;
      case '--interactive':
      case '-i':
        options.interactive = true;
        break;
      case '--help':
      case '-h':
        console.log(`
📚 Admin User Creation Script

Usage: 
  npm run create-admin [options]
  
Options:
  -e, --email <email>        Admin email address
  -p, --password <password>  Admin password (min 6 characters)
  -n, --name <name>          Admin name
  -i, --interactive          Interactive mode (prompts for input)
  -h, --help                 Show this help message

Examples:
  # Use environment variables or defaults
  npm run create-admin
  
  # Specify credentials via command line
  npm run create-admin --email admin@example.com --password secure123 --name "John Admin"
  
  # Interactive mode (prompts for input)
  npm run create-admin --interactive
  
Environment Variables:
  ADMIN_EMAIL      - Default admin email
  ADMIN_PASSWORD   - Default admin password
        `);
        process.exit(0);
        break;
    }
  }
  
  return options;
}

// Only run if this file is executed directly
if (require.main === module) {
  const options = parseArgs();
  
  createAdminUser(options)
    .then((result) => {
      process.exit(result.success ? 0 : 1);
    })
    .catch((error) => {
      console.error('❌ Unhandled error:', error);
      process.exit(1);
    });
}

export default createAdminUser;