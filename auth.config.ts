import type { NextAuthConfig } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { db } from "@/lib/db";

const authConfig: NextAuthConfig = {
  secret: process.env.AUTH_SECRET,
  session: { strategy: "jwt" },
  pages: {
    signIn: "/auth/login",
    signOut: "/auth/login",
    error: "/auth/error",
  },
  cookies: {
    sessionToken: {
      name:
        process.env.NODE_ENV === "production"
          ? "__Secure-next-auth.session-token"
          : "next-auth.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
          role: "user", // This sets default role to "user"
        };
      },
    }),
    // Diğer provider'lar eklenebilir...
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.name = user.name || undefined;
        token.email = user.email || undefined;
        token.role = user.role;
      } else if (!token.role && token.email) {
        const dbUser = await db.user.findUnique({
          where: { email: token.email as string },
        });
        if (dbUser) {
          token.id = dbUser.id;
          token.role = dbUser.role;
          token.name = `${dbUser.firstName} ${dbUser.lastName}`;
        }
      }
      return token;
    },
    async session({ token, session }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.name = token.name as string;
        session.user.email = token.email as string;
        session.user.role = token.role as string;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      // Eğer URL'de tekrarlayan callbackUrl parametresi varsa temizle
      if (url.includes('callbackUrl=') && url.includes('callbackUrl=', url.indexOf('callbackUrl=') + 12)) {
        // İlk callbackUrl değerini bul
        const firstCallbackStart = url.indexOf('callbackUrl=');
        const firstCallbackEnd = url.indexOf('&', firstCallbackStart);
        const firstCallbackValue = firstCallbackEnd !== -1 
          ? url.substring(firstCallbackStart, firstCallbackEnd)
          : url.substring(firstCallbackStart);
        
        // Tekrarlayan callbackUrl parametresini temizle
        const cleanedUrl = url.replace(/callbackUrl=.*callbackUrl=/, firstCallbackValue);
        return cleanedUrl;
      }
      
      // Normal yönlendirme mantığı
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      else if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
    async signIn() {
      return true;
    },
  },
};

export default authConfig;