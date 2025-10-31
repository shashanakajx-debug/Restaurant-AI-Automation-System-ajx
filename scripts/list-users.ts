import mongoose from 'mongoose';
import { fileURLToPath, pathToFileURL } from 'url';
import { dirname, resolve } from 'path';

const filePath = fileURLToPath(import.meta.url);
const currentDir = dirname(filePath);

async function importDependencies() {
  try {
    // ✅ Add `.ts` extension explicitly for ESM loader
    const dbConnectModule = await import(
      pathToFileURL(resolve(currentDir, '../src/lib/mongoose.ts')).href
    );
    const userModule = await import(
      pathToFileURL(resolve(currentDir, '../src/models/User.ts')).href
    );

    const dbConnect = dbConnectModule.default;
    const User = userModule.default;

    return { dbConnect, User };
  } catch (error) {
    console.error('❌ Failed to import dependencies:', error);
    process.exit(1);
  }
}

async function listUsers(role?: string) {
  const { dbConnect, User } = await importDependencies();

  try {
    console.log('🔌 Connecting to database...');
    await dbConnect();
    console.log('✅ Connected\n');

    const query = role ? { role } : {};
    const users = await User.find(query).select('-password').sort({ createdAt: -1 });

    if (users.length === 0) {
      console.log('📭 No users found');
      return { success: true, users: [] };
    }

    console.log(`📋 Found ${users.length} user(s)${role ? ` with role: ${role}` : ''}\n`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    users.forEach((user: any, index: number) => {
      const roleEmoji =
        user.role === 'admin' ? '👑' : user.role === 'staff' ? '🧑‍🍳' : '👤';
      const statusEmoji = user.isActive ? '✅' : '❌';

      console.log(`${index + 1}. ${roleEmoji} ${user.name || 'Unnamed User'}`);
      console.log(`   📧 Email:    ${user.email}`);
      console.log(`   🔑 Role:     ${user.role}`);
      console.log(`   ${statusEmoji} Active:   ${user.isActive}`);
      console.log(
        `   📅 Created:  ${
          user.createdAt
            ? new Date(user.createdAt).toLocaleDateString()
            : 'N/A'
        }`
      );
      console.log(`   🆔 ID:       ${user._id}`);
      console.log('   ─────────────────────────────────────────────────────────────────');
    });

    console.log('\n📊 Summary:');
    const admins = users.filter((u: any) => u.role === 'admin').length;
    const staff = users.filter((u: any) => u.role === 'staff').length;
    const customers = users.filter((u: any) => u.role === 'customer').length;
    const active = users.filter((u: any) => u.isActive).length;

    console.log(`   👑 Admins:     ${admins}`);
    console.log(`   🧑‍🍳 Staff:      ${staff}`);
    console.log(`   👤 Customers:  ${customers}`);
    console.log(`   ✅ Active:     ${active}`);
    console.log(`   ❌ Inactive:   ${users.length - active}\n`);

    return { success: true, users };
  } catch (error: any) {
    console.error('\n❌ Error:', error.message || error);
    return { success: false, error };
  } finally {
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
      console.log('✅ Database connection closed\n');
    }
  }
}

// ✅ CLI argument parsing
const args = process.argv.slice(2);
const roleFilter = args.find((arg) => ['admin', 'staff', 'customer'].includes(arg));

if (args.includes('--help') || args.includes('-h')) {
  console.log(`
📚 List Users Script

Usage:
  npm run list-users [role]

Arguments:
  admin      - List only admin users
  staff      - List only staff users
  customer   - List only customer users
  (none)     - List all users

Examples:
  npm run list-users
  npm run list-users admin
  npm run list-users staff
  npm run list-users customer
`);
  process.exit(0);
}

// ✅ Replace `require.main === module` (ESM safe check)
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

if (process.argv[1] === __filename) {
  listUsers(roleFilter)
    .then((result) => {
      process.exit(result.success ? 0 : 1);
    })
    .catch((error) => {
      console.error('❌ Unhandled error:', error);
      process.exit(1);
    });
}

export default listUsers;
