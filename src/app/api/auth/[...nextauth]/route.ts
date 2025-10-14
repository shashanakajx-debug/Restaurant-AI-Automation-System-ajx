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
          placeholder: "your@email.com",
        },
        password: {
          label: "Password",
          type: "password",
          placeholder: "Your password",
        },
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
            id: String(user._id),
            email: user.email,
            name: user.name || "",
            role: user.role as UserRole,
            image: null,
          };
        } catch (error) {
          console.error("[Auth] Authorization error:", error);
          return null;
        }
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
  ],

  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  callbacks: {
    async signIn({ user, account }) {
      try {
        await dbConnect();

        if (account?.provider === "google") {
          const existingUser = await User.findOne({ email: user.email }).exec();

          if (!existingUser) {
            const newUser = new User({
              email: user.email,
              name: user.name,
              role: "customer", // Default role is "customer"
              emailVerified: true,
              isActive: true,
              lastLogin: new Date(),
            });
            await newUser.save();
          } else {
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
      // Persist the user role and id into the token
      if (user) {
        token.role = user.role;
        token.id = user.id;
      }

      if (account) {
        token.accessToken = account.access_token;
      }

      console.log("JWT Callback:", token); // Debugging log to ensure token is correct

      return token;
    },

    async session({ session, token }) {
      // Assign role and id from token into session user
      console.log("Session Callback:", session);
      console.log("Token Callback:", token);

      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as UserRole;

        // Ensure role is always defined
        if (!session.user.role) {
          session.user.role = "customer" as UserRole;
          console.warn(`[Auth] User ${session.user.email} has no role, defaulting to customer`);
        }
      }

      return session;
    },
  },

  pages: {
    signIn: "/login",
    error: "/login?error",
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

  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
  },
};

const handler = NextAuth(options);
export { handler as GET, handler as POST };
