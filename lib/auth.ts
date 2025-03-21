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
//   pages: {
//     signIn: "/auth/login",
//     signOut: "/auth/login",
//     error: "/auth/error",
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
//     async session({ token, session }) {
//       if (token) {
//         session.user.id = token.id as string;
//         session.user.name = token.name as string;
//         session.user.role = token.role as string;
//       }
//       return session;
//     },
//     async jwt({ token, user }) {
//       const dbUser = await db.user.findFirst({
//         where: {
//           email: token.email as string,
//         },
//       });

//       if (!dbUser) {
//         if (user) {
//           token.id = user?.id;
//           token.role = user?.role;
//         }
//         return token;
//       }

//       return {
//         id: dbUser.id,
//         name: `${dbUser.firstName} ${dbUser.lastName}`,
//         email: dbUser.email,
//         role: dbUser.role,
//       };
//     }
//   }
// } satisfies NextAuthConfig;

// // Create the auth export
// export const { auth, handlers, signIn, signOut } = NextAuth(config);

// // Export the config for reference if needed
// export const authConfig = config;

// // Check if user is admin
// export async function isAdmin(userId: string) {
//   const user = await db.user.findFirst({
//     where: { 
//       id: userId,
//       role: "ADMIN"
//     },
//   })

//   return !!user
// }

// // Get user by ID
// export async function getUserById(userId: string) {
//   const user = await db.user.findUnique({
//     where: { id: userId },
//   })

//   return user
// }

// // Get admin by ID
// export async function getAdminById(adminId: string) {
//   const admin = await db.user.findFirst({
//     where: { 
//       id: adminId,
//       role: "ADMIN"
//     },
//   })

//   return admin
// }

// // Check if user has permission to access application
// export async function hasApplicationAccess(userId: string, applicationId: string) {
//   const application = await db.scholarshipApplication.findFirst({
//     where: {
//       id: applicationId,
//       userId,
//     },
//   })

//   return !!application
// }

// // Check if user has permission to access document
// export async function hasDocumentAccess(userId: string, documentId: string) {
//   const document = await db.document.findFirst({
//     where: {
//       id: documentId,
//       userId,
//     },
//   })

//   return !!document
// }

// // Check if user has permission to access interview
// export async function hasInterviewAccess(userId: string, interviewId: string) {
//   const interview = await db.scholarshipApplication.findFirst({
//     where: {
//       id: interviewId,
//       userId,
//     },
//   })

//   return !!interview
// }


import { PrismaAdapter } from "@auth/prisma-adapter"
import CredentialsProvider from "next-auth/providers/credentials"
import { db } from "@/lib/db"
import { compare } from "bcryptjs"
import GoogleProvider from 'next-auth/providers/google'
import NextAuth from "next-auth"
import type { NextAuthConfig } from "next-auth"

// Extend the User and JWT interfaces
declare module 'next-auth' {
  interface User {
    role?: string;
  }
  
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      role: string;
    }
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role?: string;
  }
}

// Define the configuration
const config = {
  adapter: PrismaAdapter(db),
  session: {
    strategy: "jwt",
  },
  secret: process.env.AUTH_SECRET,
  trustHost: true,
  pages: {
    signIn: "/auth/login",
    signOut: "/auth/login",
    error: "/auth/error",
  },
  cookies: {
    sessionToken: {
      name: process.env.NODE_ENV === "production" ? "__Secure-next-auth.session-token" : "next-auth.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production"
      }
    }
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await db.user.findUnique({
          where: {
            email: credentials.email as string
          }
        });

        if (!user) {
          return null;
        }

        const isPasswordValid = await compare(
          credentials.password as string,
          user.password
        );

        if (!isPasswordValid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: `${user.firstName} ${user.lastName}`,
          role: user.role,
        };
      }
    })
  ],
  callbacks: {
    async signIn() {
      return true;
    },
    async redirect({ url, baseUrl }) {
      // Handle callback URLs properly
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      // Allow callbacks to same origin
      else if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
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
    async jwt({ token, user }) {
      const dbUser = await db.user.findFirst({
        where: {
          email: token.email as string,
        },
      });

      if (!dbUser) {
        if (user) {
          token.id = user?.id;
          token.role = user?.role;
        }
        return token;
      }

      return {
        id: dbUser.id,
        name: `${dbUser.firstName} ${dbUser.lastName}`,
        email: dbUser.email,
        role: dbUser.role,
      };
    }
  }
} satisfies NextAuthConfig;

// Create the auth export
export const { auth, handlers, signIn, signOut } = NextAuth(config);

// Export the config for reference if needed
export const authConfig = config;

// All other functions remain the same
export async function isAdmin(userId: string) {
  const user = await db.user.findFirst({
    where: { 
      id: userId,
      role: "ADMIN"
    },
  })

  return !!user
}

export async function getUserById(userId: string) {
  const user = await db.user.findUnique({
    where: { id: userId },
  })

  return user
}

export async function getAdminById(adminId: string) {
  const admin = await db.user.findFirst({
    where: { 
      id: adminId,
      role: "ADMIN"
    },
  })

  return admin
}

export async function hasApplicationAccess(userId: string, applicationId: string) {
  const application = await db.scholarshipApplication.findFirst({
    where: {
      id: applicationId,
      userId,
    },
  })

  return !!application
}

export async function hasDocumentAccess(userId: string, documentId: string) {
  const document = await db.document.findFirst({
    where: {
      id: documentId,
      userId,
    },
  })

  return !!document
}

export async function hasInterviewAccess(userId: string, interviewId: string) {
  const interview = await db.scholarshipApplication.findFirst({
    where: {
      id: interviewId,
      userId,
    },
  })

  return !!interview
}