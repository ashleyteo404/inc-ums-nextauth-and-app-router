import { PrismaAdapter } from "@next-auth/prisma-adapter";
import {
  getServerSession,
  type DefaultSession,
  type NextAuthOptions,
} from "next-auth";

import CredentialsProvider from "next-auth/providers/credentials";

import { env } from "~/env";
import { db } from "~/server/db";

import bcrypt from "bcryptjs-react";

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      // ...other properties
      // role: UserRole;
    } & DefaultSession["user"];
  }

  // interface User {
  //   // ...other properties
  //   // role: UserRole;
  // }
}

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const authOptions: NextAuthOptions = {
  callbacks: {
    // async signIn({ user, account, profile, email, credentials }) {
    //   // const isAllowedToSignIn = true
    //   // if (isAllowedToSignIn) {
    //   //   console.log("user2", user)
    //   //   return true
    //   // } else {
    //   //   // Return false to display a default error message
    //   //   return false
    //   //   // Or you can return a URL to redirect to:
    //   //   // return '/unauthorized'
    //   // }
    //   if (user.id) {
    //     return `/profile/${user.id}`;
    //   } else {
    //     return true;
    //   }
    // },
    session: ({ session, token }) => ({
      ...session,
      user: {
        ...session.user,
        // default
        // id: user.id
        // but that causes TypeError: Cannot read properties of undefined (reading 'id')
        id: token.sub // represents user id
        // alternatively, you can do token.id but you will need the async jwt function below
      },
    }),
    // async jwt({ token, account, user }) {
    //   // Persist the OAuth access_token and or the user id to the token right after signin
    //   if (account) {
    //     token.accessToken = account.access_token
    //     token.id = user?.id
    //   }
    //   return token
    // },
  },
  adapter: PrismaAdapter(db),
  providers: [
    CredentialsProvider({
      // The name to display on the sign in form (e.g. "Sign in with...")
      name: "Credentials",
      // `credentials` is used to generate a form on the sign in page.
      // You can specify which fields should be submitted, by adding keys to the `credentials` object.
      // e.g. domain, username, password, 2FA token, etc.
      // You can pass any HTML attribute to the <input> tag through the object.
      credentials: {
        email: { label: "Email", type: "Email", placeholder: "johndoe@example.com" },
        password: { label: "Password", type: "Password" }
      },
      async authorize(credentials) {
        // Add logic here to look up the user from the credentials supplied
        const { email, password } = credentials as {
          email: string;
          password: string;
        }

        if (!email || !password) {
          return null;
        }

        const user = await db.user.findUnique({
          where: {
            email: email
          }
        });

        if (user) {
          const passwordsMatch = await bcrypt.compare(password, user.hashedPassword);
          
          if (!passwordsMatch) {
            return null;
          }

          return user;
        } else {
          return null;
        }
      }
    }),
    /**
     * ...add more providers here.
     *
     * Most other providers require a bit more work than the Discord provider. For example, the
     * GitHub provider requires you to add the `refresh_token_expires_in` field to the Account
     * model. Refer to the NextAuth.js docs for the provider you want to use. Example:
     *
     * @see https://next-auth.js.org/providers/github
     */
  ],
  session: {
    strategy: "jwt"
  }, 
  secret: env.NEXTAUTH_SECRET,
  debug: env.NODE_ENV === "development"
};

/**
 * Wrapper for `getServerSession` so that you don't need to import the `authOptions` in every file.
 *
 * @see https://next-auth.js.org/configuration/nextjs
 */
export const getServerAuthSession = () => getServerSession(authOptions);
