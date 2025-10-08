import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import dbConnect from "@/lib/mongoose";
import User from "@/models/User";

const options: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" }
      },

      // authorize is called when a user submits the credentials form
      async authorize(credentials) {
        try {
          console.log("[Auth] authorize called");

          if (!credentials?.email || !credentials?.password) {
            console.warn("[Auth] missing email or password");
            return null;
          }

          // normalize and connect
          const email = credentials.email.trim().toLowerCase();
          await dbConnect();

          const user = await User.findOne({ email }).exec();
          if (!user) {
            console.warn("[Auth] user not found:", email);
            return null;
          }

          // Prefer model's comparePassword. If it's missing, fall back (dev only).
          let passwordMatches = false;
          if (typeof (user as any).comparePassword === "function") {
            passwordMatches = await (user as any).comparePassword(credentials.password);
          } else {
            // fallback — not secure for production, only for quick dev setups
            console.warn("[Auth] comparePassword missing — using plain check (dev only)");
            passwordMatches = credentials.password === (user as any).password;
          }

          if (!passwordMatches) {
            console.warn("[Auth] invalid password for", email);
            return null;
          }

          // Return the minimal user object for the session
          return {
            id: user.id.toString(),
            email: user.email,
            name: user.name || "",
            role: (user as any).role || "customer"
          };
        } catch (err) {
          console.error("[Auth] authorize error:", err);
          return null;
        }
      }
    })
  ],

  session: { strategy: "jwt" },

  callbacks: {
    async jwt({ token, user }) {
      if (user) (token as any).role = (user as any).role || (token as any).role;
      return token;
    },

    async session({ session, token }) {
      if (session?.user) (session as any).user.role = (token as any).role;
      return session;
    }
  },

  pages: {
    signIn: "/api/auth/signin" // default can be used or point to your custom page
  },

  debug: process.env.NEXTAUTH_DEBUG === "true",
  secret: process.env.NEXTAUTH_SECRET || "dev-secret"
};

const handler = NextAuth(options);
export { handler as GET, handler as POST };
