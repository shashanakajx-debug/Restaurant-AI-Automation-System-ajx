import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import dbConnect from "@/lib/mongoose";
import User from "@/models/User";
import { UserRole } from "@/types/user";

const options: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { 
          label: "Email", 
          type: "email",
          placeholder: "your@email.com"
        },
        password: { 
          label: "Password", 
          type: "password",
          placeholder: "Your password"
        }
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            throw new Error("Email and password are required");
          }

          // Connect to database
          await dbConnect();

          // Find user by email
          const email = credentials.email.trim().toLowerCase();
          const user = await User.findOne({ email, isActive: true }).exec();
          
          if (!user) {
            throw new Error("Invalid email or password");
          }

          // Verify password
          const passwordMatches = await user.comparePassword(credentials.password);
          if (!passwordMatches) {
            throw new Error("Invalid email or password");
          }

          // Update last login
          user.lastLogin = new Date();
          await user.save();

          // Return user object for session
          return {
            id: String((user as any)._id),
            email: user.email,
            name: user.name || "",
            role: user.role as UserRole,
            image: null
          } as any;
        } catch (error) {
          console.error("[Auth] Authorization error:", error);
          return null;
        }
      }
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    })
  ],

  session: { 
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  callbacks: {
    async signIn({ user, account, profile }) {
      try {
        await dbConnect();
        
        if (account?.provider === "google") {
          // Handle Google OAuth
          const existingUser = await User.findOne({ email: user.email }).exec();
          
          if (!existingUser) {
            // Create new user from Google account
            const newUser = new User({
              email: user.email,
              name: user.name,
              role: "customer",
              emailVerified: true,
              isActive: true,
              lastLogin: new Date()
            });
            await newUser.save();
          } else {
            // Update existing user
            existingUser.lastLogin = new Date();
            if (!existingUser.emailVerified) {
              existingUser.emailVerified = true;
            }
            await existingUser.save();
          }
        }
        
        return true;
      } catch (error) {
        console.error("[Auth] SignIn error:", error);
        return false;
      }
    },

    async jwt({ token, user, account }) {
      // Persist the OAuth access_token and or the user id to the token right after signin
      if (user) {
        (token as any).role = (user as any).role;
        (token as any).id = (user as any).id;
      }
      
      if (account) {
        token.accessToken = account.access_token;
      }
      
      return token;
    },

    async session({ session, token }) {
      // Send properties to the client
      if (session.user) {
        (session.user as any).id = (token as any).id as string;
        (session.user as any).role = (token as any).role as UserRole;
      }
      
      return session;
    }
  },

  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },

  events: {
    async signIn({ user, account, profile, isNewUser }) {
      console.log(`[Auth] User signed in: ${user.email}`);
    },
    async signOut({ session, token }) {
      console.log(`[Auth] User signed out: ${session?.user?.email}`);
    },
  },

  debug: process.env.NODE_ENV === "development",
  secret: process.env.NEXTAUTH_SECRET,
  
  // Security options
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production'
      }
    }
  }
};

const handler = NextAuth(options);
export { handler as GET, handler as POST };
