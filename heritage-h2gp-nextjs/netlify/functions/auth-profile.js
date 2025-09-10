const { PrismaClient } = require('@prisma/client')
const jwt = require('jsonwebtoken')

const prisma = new PrismaClient()

// JWT secret - in production, this should be from environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production'

// Helper function to verify JWT token
const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET)
  } catch (error) {
    return null
  }
}

// Helper function to get user from request
const getUserFromRequest = async (event) => {
  const authHeader = event.headers.authorization
  const cookieHeader = event.headers.cookie
  
  let token = null
  
  // Try to get token from Authorization header
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7)
  }
  
  // Try to get token from cookies
  if (!token && cookieHeader) {
    const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
      const [key, value] = cookie.trim().split('=')
      acc[key] = value
      return acc
    }, {})
    token = cookies.auth_token
  }
  
  if (!token) {
    return null
  }
  
  const decoded = verifyToken(token)
  if (!decoded) {
    return null
  }
  
  try {
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    })
    return user
  } catch (error) {
    console.error('Database error:', error)
    return null
  }
}

exports.handler = async (event, context) => {
  // Enable CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  }

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    }
  }

  try {
    const path = event.path.replace('/.netlify/functions/auth-profile', '')
    
    // GET /api/auth/profile - Get current user profile
    if (event.httpMethod === 'GET' && path === '') {
      const user = await getUserFromRequest(event)
      
      if (!user) {
        return {
          statusCode: 401,
          headers,
          body: JSON.stringify({ error: 'Unauthorized' }),
        }
      }
      
      // Return user profile without sensitive data
      const userProfile = {
        id: user.id,
        email: user.email,
        name: user.name,
        studentId: user.studentId,
        studentName: user.studentName,
        role: user.role,
        createdAt: user.createdAt,
      }
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(userProfile),
      }
    }
    
    // POST /api/auth/update-profile - Update user profile
    if (event.httpMethod === 'POST' && path === '/update-profile') {
      const user = await getUserFromRequest(event)
      
      if (!user) {
        return {
          statusCode: 401,
          headers,
          body: JSON.stringify({ error: 'Unauthorized' }),
        }
      }
      
      const { studentId, studentName } = JSON.parse(event.body)
      
      // Validate input
      if (!studentId || !studentName) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Student ID and Student Name are required' }),
        }
      }
      
      // Check if studentId is already taken by another user
      const existingUser = await prisma.user.findFirst({
        where: {
          studentId: studentId,
          id: { not: user.id }
        }
      })
      
      if (existingUser) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Student ID is already taken' }),
        }
      }
      
      // Update user profile
      const updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: {
          studentId: studentId.trim(),
          studentName: studentName.trim(),
        }
      })
      
      // Return updated profile without sensitive data
      const userProfile = {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        studentId: updatedUser.studentId,
        studentName: updatedUser.studentName,
        role: updatedUser.role,
        createdAt: updatedUser.createdAt,
      }
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(userProfile),
      }
    }
    
    // POST /api/auth/logout - Logout user
    if (event.httpMethod === 'POST' && path === '/logout') {
      // For JWT-based auth, logout is handled client-side by removing the token
      // We could implement token blacklisting here if needed
      
      return {
        statusCode: 200,
        headers: {
          ...headers,
          'Set-Cookie': 'auth_token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; Secure; SameSite=Strict'
        },
        body: JSON.stringify({ message: 'Logged out successfully' }),
      }
    }
    
    // POST /api/auth/login - Demo login (for development)
    if (event.httpMethod === 'POST' && path === '/login') {
      const { email, name } = JSON.parse(event.body)
      
      if (!email || !name) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Email and name are required' }),
        }
      }
      
      // Find or create user
      let user = await prisma.user.findUnique({
        where: { email }
      })
      
      if (!user) {
        user = await prisma.user.create({
          data: {
            email,
            name,
            role: 'STUDENT', // Default role
          }
        })
      }
      
      // Generate JWT token
      const token = jwt.sign(
        { userId: user.id, email: user.email },
        JWT_SECRET,
        { expiresIn: '7d' }
      )
      
      // Return user profile and token
      const userProfile = {
        id: user.id,
        email: user.email,
        name: user.name,
        studentId: user.studentId,
        studentName: user.studentName,
        role: user.role,
        createdAt: user.createdAt,
      }
      
      return {
        statusCode: 200,
        headers: {
          ...headers,
          'Set-Cookie': `auth_token=${token}; Path=/; Max-Age=604800; HttpOnly; Secure; SameSite=Strict`
        },
        body: JSON.stringify({ user: userProfile, token }),
      }
    }
    
    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ error: 'Not found' }),
    }
    
  } catch (error) {
    console.error('Function error:', error)
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error' }),
    }
  } finally {
    await prisma.$disconnect()
  }
}
