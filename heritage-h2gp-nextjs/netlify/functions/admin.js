const { PrismaClient } = require('@prisma/client')
const jwt = require('jsonwebtoken')

const prisma = new PrismaClient()

// JWT secret - in production, this should be from environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production'

// Master key for admin access
const MASTER_KEY = process.env.MASTER_KEY || 'H2GP'

// Helper function to verify JWT token
const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET)
  } catch (error) {
    return null
  }
}

// Helper function to verify master key
const verifyMasterKey = (key) => {
  return key === 'H2GP' || key === 'h2gp'
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
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Master-Key',
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
    const path = event.path.replace('/.netlify/functions/admin', '')
    
    // Check master key for all admin endpoints
    const masterKey = event.headers['x-master-key'] || 
                     (event.body ? JSON.parse(event.body).masterKey : null)
    
    if (!verifyMasterKey(masterKey)) {
      return {
        statusCode: 403,
        headers,
        body: JSON.stringify({ error: 'Invalid master key. Admin access denied.' }),
      }
    }
    
    // GET /api/admin/attendance-records - Get all attendance records
    if (event.httpMethod === 'GET' && path === '/attendance-records') {
      const attendanceRecords = await prisma.attendance.findMany({
        include: {
          user: {
            select: {
              studentId: true,
              studentName: true,
              email: true,
              name: true
            }
          },
          session: {
            select: {
              name: true,
              date: true,
              startTime: true,
              endTime: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: 100 // Limit to last 100 records
      })
      
      const formattedRecords = attendanceRecords.map(record => ({
        id: record.id,
        studentId: record.user.studentId || 'N/A',
        studentName: record.user.studentName || record.user.name,
        email: record.user.email,
        sessionName: record.session.name,
        sessionDate: record.session.date.toISOString(),
        status: record.status,
        markedAt: record.createdAt.toISOString()
      }))
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(formattedRecords),
      }
    }
    
    // GET /api/admin/sessions - Get all sessions
    if (event.httpMethod === 'GET' && path === '/sessions') {
      const sessions = await prisma.attendanceSession.findMany({
        include: {
          createdBy: {
            select: {
              name: true,
              email: true
            }
          },
          _count: {
            select: {
              attendances: true
            }
          }
        },
        orderBy: {
          date: 'desc'
        }
      })
      
      const formattedSessions = sessions.map(session => ({
        id: session.id,
        name: session.name,
        date: session.date.toISOString(),
        startTime: session.startTime.toISOString(),
        endTime: session.endTime.toISOString(),
        isActive: session.isActive,
        attendanceCount: session._count.attendances,
        createdBy: session.createdBy?.name || 'System',
        createdAt: session.createdAt.toISOString()
      }))
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(formattedSessions),
      }
    }
    
    // GET /api/admin/stats - Get dashboard statistics
    if (event.httpMethod === 'GET' && path === '/stats') {
      const [totalUsers, totalSessions, totalAttendance, uniqueStudents] = await Promise.all([
        prisma.user.count(),
        prisma.attendanceSession.count(),
        prisma.attendance.count(),
        prisma.user.count({
          where: {
            studentId: {
              not: null
            }
          }
        })
      ])
      
      const averageAttendance = totalSessions > 0 ? totalAttendance / totalSessions : 0
      
      const stats = {
        totalStudents: uniqueStudents,
        totalSessions,
        totalAttendance,
        averageAttendance: Math.round(averageAttendance * 100) / 100
      }
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(stats),
      }
    }
    
    // POST /api/admin/create-session - Create new attendance session
    if (event.httpMethod === 'POST' && path === '/create-session') {
      const { name, date, startTime, endTime } = JSON.parse(event.body)
      
      if (!name || !date || !startTime || !endTime) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'All fields are required' }),
        }
      }
      
      // Create attendance session
      const session = await prisma.attendanceSession.create({
        data: {
          name,
          date: new Date(date),
          startTime: new Date(startTime),
          endTime: new Date(endTime),
          isActive: true,
          createdById: 'admin' // Since this is admin-created
        }
      })
      
      // Create audit log
      await prisma.auditLog.create({
        data: {
          userId: 'admin',
          action: 'CREATE_SESSION_ADMIN',
          details: `Admin created attendance session: ${name}`,
          ipAddress: event.headers['x-forwarded-for'] || event.headers['x-real-ip'] || 'unknown',
          userAgent: event.headers['user-agent'] || 'unknown'
        }
      })
      
      return {
        statusCode: 201,
        headers,
        body: JSON.stringify(session),
      }
    }
    
    // POST /api/admin/toggle-session - Toggle session active status
    if (event.httpMethod === 'POST' && path === '/toggle-session') {
      const { sessionId, isActive } = JSON.parse(event.body)
      
      if (!sessionId) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Session ID is required' }),
        }
      }
      
      const session = await prisma.attendanceSession.update({
        where: { id: sessionId },
        data: { isActive: Boolean(isActive) }
      })
      
      // Create audit log
      await prisma.auditLog.create({
        data: {
          userId: 'admin',
          action: 'TOGGLE_SESSION',
          details: `Admin ${isActive ? 'activated' : 'deactivated'} session: ${session.name}`,
          ipAddress: event.headers['x-forwarded-for'] || event.headers['x-real-ip'] || 'unknown',
          userAgent: event.headers['user-agent'] || 'unknown'
        }
      })
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(session),
      }
    }
    
    // GET /api/admin/users - Get all users
    if (event.httpMethod === 'GET' && path === '/users') {
      const users = await prisma.user.findMany({
        select: {
          id: true,
          email: true,
          name: true,
          studentId: true,
          studentName: true,
          role: true,
          createdAt: true,
          _count: {
            select: {
              attendances: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      })
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(users),
      }
    }
    
    // DELETE /api/admin/delete-user - Delete a user (admin only)
    if (event.httpMethod === 'DELETE' && path === '/delete-user') {
      const { userId } = JSON.parse(event.body)
      
      if (!userId) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'User ID is required' }),
        }
      }
      
      // Delete user and related records
      await prisma.$transaction([
        prisma.attendance.deleteMany({ where: { userId } }),
        prisma.auditLog.deleteMany({ where: { userId } }),
        prisma.user.delete({ where: { id: userId } })
      ])
      
      // Create audit log
      await prisma.auditLog.create({
        data: {
          userId: 'admin',
          action: 'DELETE_USER',
          details: `Admin deleted user: ${userId}`,
          ipAddress: event.headers['x-forwarded-for'] || event.headers['x-real-ip'] || 'unknown',
          userAgent: event.headers['user-agent'] || 'unknown'
        }
      })
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ message: 'User deleted successfully' }),
      }
    }
    
    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ error: 'Admin endpoint not found' }),
    }
    
  } catch (error) {
    console.error('Admin function error:', error)
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error' }),
    }
  } finally {
    await prisma.$disconnect()
  }
}
