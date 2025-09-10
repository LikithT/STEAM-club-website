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

// Helper function to determine attendance status based on time
const determineAttendanceStatus = (sessionStartTime, sessionEndTime, markedAt) => {
  const startTime = new Date(sessionStartTime)
  const endTime = new Date(sessionEndTime)
  const markedTime = new Date(markedAt)
  
  // If marked before session starts, it's present
  if (markedTime <= startTime) {
    return 'PRESENT'
  }
  
  // If marked within first 15 minutes of session, it's present
  const lateThreshold = new Date(startTime.getTime() + 15 * 60 * 1000) // 15 minutes
  if (markedTime <= lateThreshold) {
    return 'PRESENT'
  }
  
  // If marked within session time but after 15 minutes, it's late
  if (markedTime <= endTime) {
    return 'LATE'
  }
  
  // If marked after session ends, it's absent (shouldn't happen in normal flow)
  return 'ABSENT'
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
    const path = event.path.replace('/.netlify/functions/attendance', '')
    
    // GET /api/attendance/current-session - Get current active session
    if (event.httpMethod === 'GET' && path === '/current-session') {
      const user = await getUserFromRequest(event)
      
      if (!user) {
        return {
          statusCode: 401,
          headers,
          body: JSON.stringify({ error: 'Unauthorized' }),
        }
      }
      
      const now = new Date()
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      
      // Find active session for today
      const session = await prisma.attendanceSession.findFirst({
        where: {
          date: {
            gte: today,
            lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
          },
          isActive: true
        },
        orderBy: {
          startTime: 'asc'
        }
      })
      
      if (!session) {
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(null),
        }
      }
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          id: session.id,
          name: session.name,
          date: session.date,
          startTime: session.startTime,
          endTime: session.endTime,
          isActive: session.isActive
        }),
      }
    }
    
    // GET /api/attendance/my-records - Get user's attendance records
    if (event.httpMethod === 'GET' && path === '/my-records') {
      const user = await getUserFromRequest(event)
      
      if (!user) {
        return {
          statusCode: 401,
          headers,
          body: JSON.stringify({ error: 'Unauthorized' }),
        }
      }
      
      const today = new Date()
      const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate())
      const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000)
      
      // Get today's attendance record
      const todayRecord = await prisma.attendance.findFirst({
        where: {
          userId: user.id,
          createdAt: {
            gte: todayStart,
            lt: todayEnd
          }
        },
        include: {
          session: true
        }
      })
      
      // Get recent attendance records (last 30 days)
      const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)
      const records = await prisma.attendance.findMany({
        where: {
          userId: user.id,
          createdAt: {
            gte: thirtyDaysAgo
          }
        },
        include: {
          session: true
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: 20
      })
      
      const formattedRecords = records.map(record => ({
        id: record.id,
        date: record.session.date,
        status: record.status,
        markedAt: record.createdAt,
        sessionName: record.session.name
      }))
      
      const formattedTodayRecord = todayRecord ? {
        id: todayRecord.id,
        date: todayRecord.session.date,
        status: todayRecord.status,
        markedAt: todayRecord.createdAt,
        sessionName: todayRecord.session.name
      } : null
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          records: formattedRecords,
          todayRecord: formattedTodayRecord
        }),
      }
    }
    
    // POST /api/attendance/mark - Mark attendance for current session
    if (event.httpMethod === 'POST' && path === '/mark') {
      const user = await getUserFromRequest(event)
      
      if (!user) {
        return {
          statusCode: 401,
          headers,
          body: JSON.stringify({ error: 'Unauthorized' }),
        }
      }
      
      // Check if user profile is complete
      if (!user.studentId || !user.studentName) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Please complete your profile first' }),
        }
      }
      
      const { sessionId } = JSON.parse(event.body)
      
      if (!sessionId) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Session ID is required' }),
        }
      }
      
      // Get the session
      const session = await prisma.attendanceSession.findUnique({
        where: { id: sessionId }
      })
      
      if (!session) {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ error: 'Session not found' }),
        }
      }
      
      if (!session.isActive) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Session is not active' }),
        }
      }
      
      // Check if user already marked attendance for this session
      const existingAttendance = await prisma.attendance.findFirst({
        where: {
          userId: user.id,
          sessionId: sessionId
        }
      })
      
      if (existingAttendance) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Attendance already marked for this session' }),
        }
      }
      
      const now = new Date()
      const status = determineAttendanceStatus(session.startTime, session.endTime, now)
      
      // Create attendance record
      const attendance = await prisma.attendance.create({
        data: {
          userId: user.id,
          sessionId: sessionId,
          status: status,
          createdAt: now
        },
        include: {
          session: true,
          user: true
        }
      })
      
      // Create audit log
      await prisma.auditLog.create({
        data: {
          userId: user.id,
          action: 'MARK_ATTENDANCE',
          details: `Marked attendance for session: ${session.name}`,
          ipAddress: event.headers['x-forwarded-for'] || event.headers['x-real-ip'] || 'unknown',
          userAgent: event.headers['user-agent'] || 'unknown'
        }
      })
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          id: attendance.id,
          status: attendance.status,
          markedAt: attendance.createdAt,
          sessionName: session.name,
          message: `Attendance marked successfully as ${status}`
        }),
      }
    }
    
    // POST /api/attendance/create-session - Create new attendance session (Admin only)
    if (event.httpMethod === 'POST' && path === '/create-session') {
      const user = await getUserFromRequest(event)
      
      if (!user) {
        return {
          statusCode: 401,
          headers,
          body: JSON.stringify({ error: 'Unauthorized' }),
        }
      }
      
      if (user.role !== 'ADMIN' && user.role !== 'TEACHER') {
        return {
          statusCode: 403,
          headers,
          body: JSON.stringify({ error: 'Insufficient permissions' }),
        }
      }
      
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
          createdById: user.id
        }
      })
      
      // Create audit log
      await prisma.auditLog.create({
        data: {
          userId: user.id,
          action: 'CREATE_SESSION',
          details: `Created attendance session: ${name}`,
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
    
    // GET /api/attendance/sessions - Get all sessions (Admin only)
    if (event.httpMethod === 'GET' && path === '/sessions') {
      const user = await getUserFromRequest(event)
      
      if (!user) {
        return {
          statusCode: 401,
          headers,
          body: JSON.stringify({ error: 'Unauthorized' }),
        }
      }
      
      if (user.role !== 'ADMIN' && user.role !== 'TEACHER') {
        return {
          statusCode: 403,
          headers,
          body: JSON.stringify({ error: 'Insufficient permissions' }),
        }
      }
      
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
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(sessions),
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
