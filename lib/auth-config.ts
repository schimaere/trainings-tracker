import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

export const authOptions: NextAuthOptions = {
  secret: process.env.AUTH_SECRET,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google" && user.email) {
        try {
          // Check if user exists
          const existingUser = await sql`
            SELECT id FROM users WHERE email = ${user.email}
          `;

          const userId = user.id || crypto.randomUUID();

          if (existingUser.length === 0) {
            // Create new user
            await sql`
              INSERT INTO users (id, name, email, image, email_verified)
              VALUES (${userId}, ${user.name || null}, ${user.email}, ${user.image || null}, CURRENT_TIMESTAMP)
            `;
          } else {
            // Update user info
            await sql`
              UPDATE users 
              SET name = ${user.name || null}, image = ${user.image || null}
              WHERE email = ${user.email}
            `;
          }

          // Store account info
          if (account) {
            await sql`
              INSERT INTO accounts (
                id, user_id, type, provider, provider_account_id,
                access_token, expires_at, token_type, scope, id_token
              )
              VALUES (
                ${account.id || crypto.randomUUID()},
                ${userId},
                ${account.type},
                ${account.provider},
                ${account.providerAccountId},
                ${account.access_token || null},
                ${account.expires_at || null},
                ${account.token_type || null},
                ${account.scope || null},
                ${account.id_token || null}
              )
              ON CONFLICT (provider, provider_account_id) 
              DO UPDATE SET
                access_token = EXCLUDED.access_token,
                expires_at = EXCLUDED.expires_at,
                token_type = EXCLUDED.token_type,
                scope = EXCLUDED.scope,
                id_token = EXCLUDED.id_token
            `;
          }
        } catch (error) {
          console.error("Error in signIn callback:", error);
          return false;
        }
      }
      return true;
    },
    async session({ session, token }) {
      if (session.user && token.sub) {
        const userWithId = session.user as { id: string; name?: string | null; email?: string | null; image?: string | null };
        userWithId.id = token.sub;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
      }
      return token;
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
};

