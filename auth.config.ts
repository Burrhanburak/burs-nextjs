import type { NextAuthConfig } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { db } from "@/lib/db";
import bcrypt from "bcrypt"; // Şifre karşılaştırması için

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
          role: "USER", // Default role as "USER" (not "user" - consistency with DB)
        };
      },
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Şifre", type: "password" }
      },
      async authorize(credentials) {
        console.log("Auth attempt with email:", credentials?.email);

        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          // Veritabanından kullanıcı sorgusu
          const user = await db.user.findUnique({
            where: { email: credentials.email as string }
          });
          console.log("User found:", user ? "Yes" : "No");
          if (!user || !user.password) {
            return null;
          }

          // Şifre doğrulama - bcrypt kullanıyorsanız
          const passwordMatch = await bcrypt.compare(
            credentials.password as string, 
            user.password
          );
          console.log("Password match:", passwordMatch);
          
          if (!passwordMatch) {
            return null;
          }

          // Ensure default role if none exists
          const userRole = user.role || "USER";
          console.log(`User authenticated with role: ${userRole}`);

          return {
            id: user.id,
            name: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
            email: user.email,
            role: userRole,
            image: user.image || null
          };
        } catch (error) {
          console.error("Auth error:", error);
          return null;
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      console.log("JWT callback - incoming token:", JSON.stringify(token));
      console.log("JWT callback - user data:", user ? JSON.stringify(user) : "No user data");
      
      if (user) {
        // Initial sign in - set all properties from user object
        token.id = user.id;
        token.name = user.name || undefined;
        token.email = user.email || undefined;
        token.role = user.role || "USER"; // Ensure role is set with default
        console.log("JWT callback - token updated from user:", JSON.stringify(token));
      } else if (token && (!token.role || token.role === undefined) && token.email) {
        // Role missing but we have email - get from DB
        console.log("JWT callback - role missing, fetching from DB");
        try {
          const dbUser = await db.user.findUnique({
            where: { email: token.email as string },
          });
          if (dbUser) {
            token.id = dbUser.id;
            token.role = dbUser.role || "USER"; // Ensure default role
            token.name = `${dbUser.firstName || ''} ${dbUser.lastName || ''}`.trim();
            console.log("JWT callback - token updated from DB:", JSON.stringify(token));
          } else {
            // User not in DB, set default role
            token.role = "USER";
            console.log("JWT callback - user not in DB, set default role");
          }
        } catch (error) {
          console.error("Error fetching user in JWT callback:", error);
          // Fail-safe default role
          token.role = "USER";
        }
      }
      
      console.log("JWT callback - final token:", JSON.stringify(token));
      return token;
    },
    async session({ token, session }) {
      console.log("Session callback - token:", JSON.stringify(token));
      
      if (token) {
        session.user.id = token.id as string;
        session.user.name = token.name as string;
        session.user.email = token.email as string;
        session.user.role = (token.role as string) || "USER"; // Ensure role with default
        console.log("Session callback - updated session:", JSON.stringify(session));
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      // Debugging
      console.log("Redirect callback:", { url, baseUrl });
      
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
        console.log("Cleaned URL:", cleanedUrl);
        return cleanedUrl;
      }
      
      // URL decode et - encoded parametreleri düzgün işlemek için
      try {
        const decodedUrl = decodeURIComponent(url);
        
        // Normal yönlendirme mantığı
        if (decodedUrl.startsWith("/")) {
          return `${baseUrl}${decodedUrl}`;
        } else if (new URL(decodedUrl).origin === baseUrl) {
          return decodedUrl;
        }
      } catch (error) {
        console.error("URL decode error:", error);
      }
      
      return baseUrl;
    },
    async signIn() {
      return true;
    },
  },
};

export default authConfig;