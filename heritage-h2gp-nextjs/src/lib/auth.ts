import { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "./prisma"
import { UserRole } from "@prisma/client"

const adminEmails = process.env.ADMIN_EMAILS?.split(',').map(email => email.trim()) || []

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      }
    })
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "google") {
        try {
          // Check if user exists
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email! }
          })

          if (!existingUser) {
            // Create new user with role based on admin emails
            const role = adminEmails.includes(user.email!) ? UserRole.ADMIN : UserRole.STUDENT
            
            await prisma.user.create({
              data: {
                email: user.email!,
                displayName: user.name,
                googleSub: account.providerAccountId,
                role: role
              }
            })
          } else if (!existingUser.googleSub) {
            // Update existing user with Google sub
            await prisma.user.update({
              where: { email: user.email! },
              data: {
                googleSub: account.providerAccountId,
                displayName: user.name || existingUser.displayName
              }
            })
          }

          return true
        } catch (error) {
          console.error("Error during sign in:", error)
          return false
        }
      }
      return true
    },
    async session({ session, user }) {
      if (session.user) {
        // Get user data from database
        const dbUser = await prisma.user.findUnique({
          where: { email: session.user.email! },
          select: {
            id: true,
            email: true,
            displayName: true,
            studentId: true,
            role: true,
            googleSub: true
          }
        })

        if (dbUser) {
          session.user.id = dbUser.id
          session.user.role = dbUser.role
          session.user.studentId = dbUser.studentId
          session.user.displayName = dbUser.displayName
          session.user.googleSub = dbUser.googleSub
        }
      }
      return session
    },
    async jwt({ token, user, account }) {
      if (account && user) {
        token.role = user.role
        token.studentId = user.studentId
        token.googleSub = account.providerAccountId
      }
      return token
    }
  },
  session: {
    strategy: "database",
    maxAge: parseInt(process.env.SESSION_TIMEOUT_HOURS || "24") * 60 * 60, // Convert hours to seconds
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
    newUser: "/auth/setup"
  },
  events: {
    async signIn({ user, account, isNewUser }) {
      if (isNewUser && account?.provider === "google") {
        // Log new user registration
        console.log(`New user registered: ${user.email} via Google`)
        
        // Create audit log
        const dbUser = await prisma.user.findUnique({
          where: { email: user.email! }
        })
        
        if (dbUser) {
          await prisma.auditLog.create({
            data: {
              actorUserId: dbUser.id,
              action: "USER_REGISTERED",
              targetType: "USER",
              targetId: dbUser.id,
              metadata: {
                provider: account.provider,
                isNewUser: true
              }
            }
          })
        }
      }
    }
  },
  debug: process.env.NODE_ENV === "development"
}

// Helper function to check if user is admin
export async function isAdmin(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true }
  })
  return user?.role === UserRole.ADMIN || user?.role === UserRole.TEACHER
}

// Helper function to get user role
export async function getUserRole(userId: string): Promise<UserRole | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true }
  })
  return user?.role || null
}

// Helper function to require admin access
export async function requireAdmin(userId: string) {
  const admin = await isAdmin(userId)
  if (!admin) {
    throw new Error("Admin access required")
  }
}
