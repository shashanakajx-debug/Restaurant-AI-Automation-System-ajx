import NextAuth, { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import dbConnect from '@/lib/mongoose'
import User from '@/models/User'
import { UserRole } from '@/types/user'
const logger = require('@/lib/logger').default;

const options: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email', placeholder: 'your@email.com' },
        password: {
          label: 'Password',
          type: 'password',
          placeholder: 'Your password',
        },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password)
            throw new Error('Email and password are required')

          await dbConnect()

          const email = credentials.email.trim().toLowerCase()
          const user = await User.findOne({ email, isActive: true }).exec()
          if (!user) throw new Error('Invalid email or password')

          const isMatch = await user.comparePassword(credentials.password)
          if (!isMatch) throw new Error('Invalid email or password')

          user.lastLogin = new Date()
          await user.save()

          return {
            id: String(user._id),
            email: user.email,
            name: user.name || '',
            role: user.role,
            image: null,
          }
        } catch (err) {
          logger.error('[Auth] Authorization error:', err)
          return null
        }
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),
  ],

  session: { strategy: 'jwt', maxAge: 30 * 24 * 60 * 60 },

  callbacks: {
    async signIn({ user, account }) {
      try {
        await dbConnect()
        if (account?.provider === 'google') {
          const existingUser = await User.findOne({ email: user.email }).exec()
          if (!existingUser) {
            const newUser = new User({
              email: user.email,
              name: user.name,
              role: 'customer',
              emailVerified: true,
              isActive: true,
              lastLogin: new Date(),
            })
            await newUser.save()
          } else {
            existingUser.lastLogin = new Date()
            if (!existingUser.emailVerified) existingUser.emailVerified = true
            await existingUser.save()
          }
        }
        return true
      } catch (err) {
        logger.error('[Auth] SignIn error:', err)
        return false
      }
    },

    async jwt({ token, user, account }) {
      if (user) {
        token.id = (user as any).id
        token.role = (user as any).role
      }
      if (account) token.accessToken = account.access_token
      return token
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as UserRole
      }
      return session
    },
  },

  pages: { signIn: '/login', error: '/login?error' },

  events: {
    async signIn({ user }) {
    const logger = require('@/lib/logger').default;
    logger.info(`[Auth] User signed in: ${user.email}`)
    },
    async signOut({ session }) {
    logger.info(`[Auth] User signed out: ${session?.user?.email}`)
    },
  },

  debug: process.env.NODE_ENV === 'development',
  secret: process.env.NEXTAUTH_SECRET,

  cookies: {
    sessionToken: {
      name: 'next-auth.session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
  },
}

const handler = NextAuth(options)
export { handler as GET, handler as POST }
