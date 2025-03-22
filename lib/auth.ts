// import { PrismaAdapter } from "@auth/prisma-adapter"
// import CredentialsProvider from "next-auth/providers/credentials"
// import { db } from "@/lib/db"
// import { compare } from "bcryptjs"
// import GoogleProvider from 'next-auth/providers/google'
// import NextAuth from "next-auth"
// import type { NextAuthConfig } from "next-auth"

// // Extend the User and JWT interfaces
// declare module 'next-auth' {
//   interface User {
//     role?: string;
//   }
  
//   interface Session {
//     user: {
//       id: string;
//       name: string;
//       email: string;
//       role: string;
//     }
//   }
// }

// declare module 'next-auth/jwt' {
//   interface JWT {
//     role?: string;
//   }
// }

// // Define the configuration
// const config = {
//   adapter: PrismaAdapter(db),
//   session: {
//     strategy: "jwt",
//   },
//   secret: process.env.AUTH_SECRET,
//   trustHost: true,
//   pages: {
//     signIn: "/auth/login",
//     signOut: "/auth/login",
//     error: "/auth/error",
//   },
//   cookies: {
//     sessionToken: {
//       name: process.env.NODE_ENV === "production" ? "__Secure-next-auth.session-token" : "next-auth.session-token",
//       options: {
//         httpOnly: true,
//         sameSite: "lax",
//         path: "/",
//         secure: process.env.NODE_ENV === "production"
//       }
//     }
//   },
//   providers: [
//     GoogleProvider({
//       clientId: process.env.GOOGLE_CLIENT_ID!,
//       clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
//     }),
//     CredentialsProvider({
//       name: 'credentials',
//       credentials: {
//         email: { label: 'Email', type: 'email' },
//         password: { label: 'Password', type: 'password' }
//       },
//       async authorize(credentials) {
//         if (!credentials?.email || !credentials?.password) {
//           return null;
//         }

//         const user = await db.user.findUnique({
//           where: {
//             email: credentials.email as string
//           }
//         });

//         if (!user) {
//           return null;
//         }

//         const isPasswordValid = await compare(
//           credentials.password as string,
//           user.password
//         );

//         if (!isPasswordValid) {
//           return null;
//         }

//         return {
//           id: user.id,
//           email: user.email,
//           name: `${user.firstName} ${user.lastName}`,
//           role: user.role,
//         };
//       }
//     })
//   ],
//   callbacks: {
//     async signIn() {
//       return true;
//     },
//     async redirect({ url, baseUrl }) {
//       // Handle callback URLs properly
//       if (url.startsWith("/")) return `${baseUrl}${url}`;
//       // Allow callbacks to same origin
//       else if (new URL(url).origin === baseUrl) return url;
//       return baseUrl;
//     },
//     async session({ token, session }) {
//       if (token) {
//         session.user.id = token.id as string;
//         session.user.name = token.name as string;
//         session.user.email = token.email as string;
//         session.user.role = token.role as string;
//       }
//       return session;
//     },
//     async jwt({ token, user }) {
//       // If this is a sign-in
//       if (user) {
//         token.id = user.id;
//         token.role = user.role;
//         token.name = user.name;
//         token.email = user.email;
//         token.role = user.role;
      
//       } else if (!token.role && token.email) {
//         // Sonraki isteklerde token içinde role eksikse, veritabanından çekin
//         const dbUser = await db.user.findUnique({
//           where: { email: token.email as string },
//         });
//         if (dbUser) {
//           token.id = dbUser.id;
//           token.role = dbUser.role;
//           token.name = `${dbUser.firstName} ${dbUser.lastName}`;
//         }
//       }
      
//       // On subsequent requests, try to fetch the user again to ensure role is up to date
//       // try {
//       //   const dbUser = await db.user.findFirst({
//       //     where: {
//       //       email: token.email as string,
//       //     },
//       //   });
  
//       //   if (dbUser) {
//       //     token.id = dbUser.id;
//       //     token.name = `${dbUser.firstName} ${dbUser.lastName}`;
//       //     token.email = dbUser.email;
//       //     token.role = dbUser.role;
          
//       //     // Debugging in development
//       //     if (process.env.NODE_ENV === 'development') {
//       //       console.log('JWT Token Updated:', { 
//       //         id: token.id,
//       //         email: token.email,
//       //         role: token.role 
//       //       });
//       //     }
//       //   } 
//       //   // If user not found in User table, set role based on email domain or other checks
//       //   else {
//       //     // Check if this user should be an admin
//       //     // This is a safer approach since the Admin model isn't accessible directly
//       //     if (token.email && [
//       //       'admin@example.com',
           
//       //       // Add any other admin emails
//       //     ].includes(token.email as string)) {
//       //       token.role = 'ADMIN';
            
//       //       if (process.env.NODE_ENV === 'development') {
//       //         console.log('Special Admin JWT Token Updated:', { 
//       //           email: token.email,
//       //           role: token.role 
//       //         });
//       //       }
//       //     }
//       //   }
//       // } catch (error) {
//       //   console.error('JWT Callback Error:', error);
//       // }
  
//       return token;
//     }
//   }
// } satisfies NextAuthConfig;

// // Create the auth export
// export const { auth, handlers, signIn, signOut } = NextAuth(config);

// // Export the config for reference if needed
// export const authConfig = config;

// // All other functions remain the same
// export async function isAdmin(userId: string) {
//   const user = await db.user.findFirst({
//     where: { 
//       id: userId,
//       role: "ADMIN"
//     },
//   })

//   return !!user
// }

// export async function getUserById(userId: string) {
//   const user = await db.user.findUnique({
//     where: { id: userId },
//   })

//   return user
// }

// export async function getAdminById(userId: string) {
//   const admin = await db.user.findFirst({
//     where: { 
//       id: userId,
//       role: "ADMIN"
//     },
//   })

//   return admin
// }

// export async function hasApplicationAccess(userId: string, applicationId: string) {
//   const application = await db.scholarshipApplication.findFirst({
//     where: {
//       id: applicationId,
//       userId,
//     },
//   })

//   return !!application
// }

// export async function hasDocumentAccess(userId: string, documentId: string) {
//   const document = await db.document.findFirst({
//     where: {
//       id: documentId,
//       userId,
//     },
//   })

//   return !!document
// }

// export async function hasInterviewAccess(userId: string, interviewId: string) {
//   const interview = await db.scholarshipApplication.findFirst({
//     where: {
//       id: interviewId,
//       userId,
//     },
//   })

//   return !!interview
// }

import NextAuth from "next-auth";
import authConfig from "@/auth.config";
import { db } from "@/lib/db";

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
export const authConfigExport = authConfig;

// Utility functions for authorization
export async function isAdmin(userId: string) {
  const user = await db.user.findFirst({
    where: { 
      id: userId,
      role: "ADMIN"
    },
  });

  return !!user;
}

export async function getUserById(userId: string) {
  const user = await db.user.findUnique({
    where: { id: userId },
  });

  return user;
}

export async function getAdminById(userId: string) {
  const admin = await db.user.findFirst({
    where: { 
      id: userId,
      role: "ADMIN"
    },
  });

  return admin;
}

export async function hasApplicationAccess(userId: string, applicationId: string) {
  const application = await db.scholarshipApplication.findFirst({
    where: {
      id: applicationId,
      userId,
    },
  });

  return !!application;
}

export async function hasDocumentAccess(userId: string, documentId: string) {
  const document = await db.document.findFirst({
    where: {
      id: documentId,
      userId,
    },
  });

  return !!document;
}

export async function hasInterviewAccess(userId: string, interviewId: string) {
  const interview = await db.scholarshipApplication.findFirst({
    where: {
      id: interviewId,
      userId,
    },
  });

  return !!interview;
}
