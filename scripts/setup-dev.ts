import dotenv from 'dotenv';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';

// Load environment variables
dotenv.config({ path: '.env.local' });

const exists = promisify(fs.exists);
const writeFile = promisify(fs.writeFile);

async function setupDevEnvironment() {
  console.log('🚀 Setting up development environment...');

  // 1. Check for .env file
  const envPath = path.join(process.cwd(), '.env.local');
  if (!await exists(envPath)) {
    console.log('📝 Creating .env.local file...');
    const envContent = `MONGODB_URI=mongodb://localhost:27017/restaurant-ai
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-development-secret
NEXT_PUBLIC_APP_URL=http://localhost:3000
OPENAI_API_KEY=your-openai-api-key
`;
    await writeFile(envPath, envContent);
    console.log('✅ Created .env.local file');
  }

  // 2. Install dependencies
  console.log('📦 Installing dependencies...');
  execSync('npm install', { stdio: 'inherit' });

  // 3. Build the project
  console.log('🔨 Building project...');
  execSync('npm run build', { stdio: 'inherit' });

  // 4. Run database seeding
  console.log('🌱 Seeding database...');
  execSync('npm run seed', { stdio: 'inherit' });

  console.log('✨ Development environment setup complete!');
  console.log('\nNext steps:');
  console.log('1. Update .env.local with your environment variables');
  console.log('2. Start the development server: npm run dev');
  console.log('3. Access the application at http://localhost:3000');
}

setupDevEnvironment().catch((error) => {
  console.error('❌ Setup failed:', error);
  process.exit(1);
});