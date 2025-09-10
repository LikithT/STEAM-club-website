const { PrismaClient } = require('@prisma/client')
const jwt = require('jsonwebtoken')
const XLSX = require('xlsx')

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

// Helper function to format date for filename
const formatDateForFilename = (date) => {
  return date.toISOString().split('T')[0]
}

// Helper function to create CSV content
const createCSV = (data, headers) => {
  const csvHeaders = headers.join(',')
  const csvRows = data.map(row => 
    headers.map(header => {
      const value = row[header] || ''
      // Escape commas and quotes in CSV
      if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
        return `"${value.replace(/"/g, '""')}"`
      }
      return value
    }).join(',')
  )
  return [csvHeaders, ...csvRows].join('\n')
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
    const path = event.path.replace('/.netlify/functions/export', '')
    
    // GET /api/export/attendance - Export attendance data
    if (event.httpMethod === 'GET' && path === '/attendance') {
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
      
      const queryParams = new URLSearchParams(event.queryStringParameters || {})
      const format = queryParams.get('format') || 'xlsx'
      const startDate = queryParams.get('startDate')
      const endDate = queryParams.get('endDate')
      const sessionId = queryParams.get('sessionId')
      
      // Build where clause for filtering
      let whereClause = {}
      
      if (startDate && endDate) {
        whereClause.createdAt = {
          gte: new Date(startDate),
          lte: new Date(endDate)
        }
      }
      
      if (sessionId) {
        whereClause.sessionId = sessionId
      }
      
      // Fetch attendance data with related information
      const attendanceData = await prisma.attendance.findMany({
        where: whereClause,
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
        orderBy: [
          { session: { date: 'desc' } },
          { createdAt: 'desc' }
        ]
      })
      
      // Format data for export
      const exportData = attendanceData.map(record => ({
        'Student ID': record.user.studentId || 'N/A',
        'Student Name': record.user.studentName || record.user.name,
        'Email': record.user.email,
        'Session Name': record.session.name,
        'Session Date': record.session.date.toLocaleDateString(),
        'Session Start': record.session.startTime.toLocaleTimeString(),
        'Session End': record.session.endTime.toLocaleTimeString(),
        'Attendance Status': record.status,
        'Marked At': record.createdAt.toLocaleString(),
        'Marked Date': record.createdAt.toLocaleDateString(),
        'Marked Time': record.createdAt.toLocaleTimeString()
      }))
      
      const filename = `attendance_export_${formatDateForFilename(new Date())}`
      
      if (format === 'csv') {
        const csvHeaders = [
          'Student ID', 'Student Name', 'Email', 'Session Name', 'Session Date',
          'Session Start', 'Session End', 'Attendance Status', 'Marked At',
          'Marked Date', 'Marked Time'
        ]
        
        const csvContent = createCSV(exportData, csvHeaders)
        
        // Create audit log
        await prisma.auditLog.create({
          data: {
            userId: user.id,
            action: 'EXPORT_ATTENDANCE',
            details: `Exported attendance data as CSV (${exportData.length} records)`,
            ipAddress: event.headers['x-forwarded-for'] || event.headers['x-real-ip'] || 'unknown',
            userAgent: event.headers['user-agent'] || 'unknown'
          }
        })
        
        return {
          statusCode: 200,
          headers: {
            ...headers,
            'Content-Type': 'text/csv',
            'Content-Disposition': `attachment; filename="${filename}.csv"`
          },
          body: csvContent,
        }
      } else {
        // Excel format
        const worksheet = XLSX.utils.json_to_sheet(exportData)
        const workbook = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Attendance Data')
        
        // Set column widths for better readability
        const columnWidths = [
          { wch: 12 }, // Student ID
          { wch: 20 }, // Student Name
          { wch: 25 }, // Email
          { wch: 20 }, // Session Name
          { wch: 12 }, // Session Date
          { wch: 12 }, // Session Start
          { wch: 12 }, // Session End
          { wch: 15 }, // Attendance Status
          { wch: 20 }, // Marked At
          { wch: 12 }, // Marked Date
          { wch: 12 }  // Marked Time
        ]
        worksheet['!cols'] = columnWidths
        
        const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' })
        
        // Create audit log
        await prisma.auditLog.create({
          data: {
            userId: user.id,
            action: 'EXPORT_ATTENDANCE',
            details: `Exported attendance data as Excel (${exportData.length} records)`,
            ipAddress: event.headers['x-forwarded-for'] || event.headers['x-real-ip'] || 'unknown',
            userAgent: event.headers['user-agent'] || 'unknown'
          }
        })
        
        return {
          statusCode: 200,
          headers: {
            ...headers,
            'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Content-Disposition': `attachment; filename="${filename}.xlsx"`
          },
          body: excelBuffer.toString('base64'),
          isBase64Encoded: true,
        }
      }
    }
    
    // GET /api/export/users - Export users data
    if (event.httpMethod === 'GET' && path === '/users') {
      const user = await getUserFromRequest(event)
      
      if (!user) {
        return {
          statusCode: 401,
          headers,
          body: JSON.stringify({ error: 'Unauthorized' }),
        }
      }
      
      if (user.role !== 'ADMIN') {
        return {
          statusCode: 403,
          headers,
          body: JSON.stringify({ error: 'Admin access required' }),
        }
      }
      
      const queryParams = new URLSearchParams(event.queryStringParameters || {})
      const format = queryParams.get('format') || 'xlsx'
      
      // Fetch users data
      const usersData = await prisma.user.findMany({
        select: {
          studentId: true,
          studentName: true,
          name: true,
          email: true,
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
      
      // Format data for export
      const exportData = usersData.map(user => ({
        'Student ID': user.studentId || 'N/A',
        'Student Name': user.studentName || 'N/A',
        'Google Name': user.name,
        'Email': user.email,
        'Role': user.role,
        'Registration Date': user.createdAt.toLocaleDateString(),
        'Total Attendance Records': user._count.attendances
      }))
      
      const filename = `users_export_${formatDateForFilename(new Date())}`
      
      if (format === 'csv') {
        const csvHeaders = [
          'Student ID', 'Student Name', 'Google Name', 'Email', 'Role',
          'Registration Date', 'Total Attendance Records'
        ]
        
        const csvContent = createCSV(exportData, csvHeaders)
        
        // Create audit log
        await prisma.auditLog.create({
          data: {
            userId: user.id,
            action: 'EXPORT_USERS',
            details: `Exported users data as CSV (${exportData.length} records)`,
            ipAddress: event.headers['x-forwarded-for'] || event.headers['x-real-ip'] || 'unknown',
            userAgent: event.headers['user-agent'] || 'unknown'
          }
        })
        
        return {
          statusCode: 200,
          headers: {
            ...headers,
            'Content-Type': 'text/csv',
            'Content-Disposition': `attachment; filename="${filename}.csv"`
          },
          body: csvContent,
        }
      } else {
        // Excel format
        const worksheet = XLSX.utils.json_to_sheet(exportData)
        const workbook = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Users Data')
        
        // Set column widths
        const columnWidths = [
          { wch: 12 }, // Student ID
          { wch: 20 }, // Student Name
          { wch: 20 }, // Google Name
          { wch: 25 }, // Email
          { wch: 10 }, // Role
          { wch: 15 }, // Registration Date
          { wch: 20 }  // Total Attendance Records
        ]
        worksheet['!cols'] = columnWidths
        
        const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' })
        
        // Create audit log
        await prisma.auditLog.create({
          data: {
            userId: user.id,
            action: 'EXPORT_USERS',
            details: `Exported users data as Excel (${exportData.length} records)`,
            ipAddress: event.headers['x-forwarded-for'] || event.headers['x-real-ip'] || 'unknown',
            userAgent: event.headers['user-agent'] || 'unknown'
          }
        })
        
        return {
          statusCode: 200,
          headers: {
            ...headers,
            'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Content-Disposition': `attachment; filename="${filename}.xlsx"`
          },
          body: excelBuffer.toString('base64'),
          isBase64Encoded: true,
        }
      }
    }
    
    // GET /api/export/sessions - Export sessions data
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
      
      const queryParams = new URLSearchParams(event.queryStringParameters || {})
      const format = queryParams.get('format') || 'xlsx'
      
      // Fetch sessions data
      const sessionsData = await prisma.attendanceSession.findMany({
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
      
      // Format data for export
      const exportData = sessionsData.map(session => ({
        'Session Name': session.name,
        'Date': session.date.toLocaleDateString(),
        'Start Time': session.startTime.toLocaleTimeString(),
        'End Time': session.endTime.toLocaleTimeString(),
        'Status': session.isActive ? 'Active' : 'Inactive',
        'Total Attendances': session._count.attendances,
        'Created By': session.createdBy.name,
        'Creator Email': session.createdBy.email,
        'Created At': session.createdAt.toLocaleString()
      }))
      
      const filename = `sessions_export_${formatDateForFilename(new Date())}`
      
      if (format === 'csv') {
        const csvHeaders = [
          'Session Name', 'Date', 'Start Time', 'End Time', 'Status',
          'Total Attendances', 'Created By', 'Creator Email', 'Created At'
        ]
        
        const csvContent = createCSV(exportData, csvHeaders)
        
        // Create audit log
        await prisma.auditLog.create({
          data: {
            userId: user.id,
            action: 'EXPORT_SESSIONS',
            details: `Exported sessions data as CSV (${exportData.length} records)`,
            ipAddress: event.headers['x-forwarded-for'] || event.headers['x-real-ip'] || 'unknown',
            userAgent: event.headers['user-agent'] || 'unknown'
          }
        })
        
        return {
          statusCode: 200,
          headers: {
            ...headers,
            'Content-Type': 'text/csv',
            'Content-Disposition': `attachment; filename="${filename}.csv"`
          },
          body: csvContent,
        }
      } else {
        // Excel format
        const worksheet = XLSX.utils.json_to_sheet(exportData)
        const workbook = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Sessions Data')
        
        // Set column widths
        const columnWidths = [
          { wch: 20 }, // Session Name
          { wch: 12 }, // Date
          { wch: 12 }, // Start Time
          { wch: 12 }, // End Time
          { wch: 10 }, // Status
          { wch: 15 }, // Total Attendances
          { wch: 20 }, // Created By
          { wch: 25 }, // Creator Email
          { wch: 20 }  // Created At
        ]
        worksheet['!cols'] = columnWidths
        
        const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' })
        
        // Create audit log
        await prisma.auditLog.create({
          data: {
            userId: user.id,
            action: 'EXPORT_SESSIONS',
            details: `Exported sessions data as Excel (${exportData.length} records)`,
            ipAddress: event.headers['x-forwarded-for'] || event.headers['x-real-ip'] || 'unknown',
            userAgent: event.headers['user-agent'] || 'unknown'
          }
        })
        
        return {
          statusCode: 200,
          headers: {
            ...headers,
            'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Content-Disposition': `attachment; filename="${filename}.xlsx"`
          },
          body: excelBuffer.toString('base64'),
          isBase64Encoded: true,
        }
      }
    }
    
    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ error: 'Export endpoint not found' }),
    }
    
  } catch (error) {
    console.error('Export function error:', error)
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error' }),
    }
  } finally {
    await prisma.$disconnect()
  }
}
