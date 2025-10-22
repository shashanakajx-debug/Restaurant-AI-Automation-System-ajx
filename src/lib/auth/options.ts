import NextAuth, { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import dbConnect from '@/lib/mongoose';
import User from '@/models/User';
import { UserRole } from '@/types/user';
import bcrypt from 'bcryptjs';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) return null;
          
          try {
            await dbConnect();
          } catch (error) {
              const logger = require('../../lib/logger').default;
              logger.info('[Auth] Using mock database for authentication');
          }
          
          const email = credentials.email.trim().toLowerCase();
          
          // Try to find user in database
          let user;
          try {
            user = await User.findOne({ email, isActive: true });
          } catch (error) {
              const logger = require('../../lib/logger').default;
              logger.error('[Auth] Error finding user:', error);
            
            // Check if we're using mock database
            if (global.__mockDatabase) {
              console.log('[Auth] Checking mock database for user');
              const mockDb = global.__mockDatabase;
              const users = mockDb.findInCollection('users', { email });
              
              // For development, if user is admin@example.com, create it in mock DB
              if (email === 'dev.admin@example.com' && users.length === 0) {
                  const logger = require('../../lib/logger').default;
                  logger.info('[Auth] Creating default admin user in mock database');
                const hashedPassword = await bcrypt.hash('admin123', 12);
                user = mockDb.addToCollection('users', {
                  email,
                  password: hashedPassword,
                  name: 'Admin User',
                  role: 'admin',
                  isActive: true,
                  emailVerified: true,
                  lastLogin: new Date()
                });
              } else if (users.length > 0) {
                user = users[0];
              }
            }
          }
          
          if (!user) return null;
          
          // Verify password
          let valid = false;
          try {
            if (typeof user.comparePassword === 'function') {
              valid = await user.comparePassword(credentials.password);
            } else {
              // For mock database, manually compare password
              const mockPassword = credentials.password;
              valid = await bcrypt.compare(mockPassword, user.password);
            }
          } catch (error) {
              const logger = require('../../lib/logger').default;
              logger.error('[Auth] Password comparison error:', error);
            // For dev.admin@example.com in development, allow password 'admin123'
            if (process.env.NODE_ENV !== 'production' && 
                email === 'dev.admin@example.com' && 
                credentials.password === 'admin123') {
              valid = true;
            }
          }
          
          if (!valid) return null;
          
          // Update last login
          try {
            if (typeof user.save === 'function') {
              user.lastLogin = new Date();
              await user.save();
            } else if (global.__mockDatabase) {
              global.__mockDatabase.updateInCollection('users', { email }, { lastLogin: new Date() });
            }
          } catch (error) {
              const logger = require('../../lib/logger').default;
              logger.error('[Auth] Error updating last login:', error);
          }
          
          return {
            id: String(user._id || Math.random().toString(36).substring(2, 15)),
            email: user.email,
            name: user.name || '',
            role: user.role as UserRole,
            image: null,
          } as any;
        } catch (error) {
            const logger = require('../../lib/logger').default;
            logger.error('[Auth] authorize error', error);
          return null;
        }
      }
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || ''
    })
  ],
  session: { strategy: 'jwt', maxAge: 30 * 24 * 60 * 60 },
  callbacks: {
    async signIn({ user, account }) {
      try {
        await dbConnect();
        if (account?.provider === 'google') {
          const existingUser = await User.findOne({ email: user.email }).exec();
          if (!existingUser) {
            const newUser = new User({
              email: user.email,
              name: user.name,
              role: 'customer',
              emailVerified: true,
              isActive: true,
              lastLogin: new Date(),
            });
            await newUser.save();
          } else {
            existingUser.lastLogin = new Date();
            if (!existingUser.emailVerified) existingUser.emailVerified = true;
            await existingUser.save();
          }
        }
        return true;
      } catch (error) {
          const logger = require('../../lib/logger').default;
          logger.error('[Auth] signIn error', error);
        return false;
      }
    },
    async jwt({ token, user, account }) {
      if (user) {
        (token as any).role = (user as any).role;
        (token as any).id = (user as any).id;
      }
      if (account) token.accessToken = (account as any).access_token;
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = (token as any).id as string;
        (session.user as any).role = (token as any).role as UserRole;
      }
      return session;
    }
  },
  pages: { signIn: '/login', error: '/login?error' },
  debug: process.env.NODE_ENV === 'development',
  secret: process.env.NEXTAUTH_SECRET,
};

export default authOptions;
