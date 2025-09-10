"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { CheckCircle, Clock, User, Calendar, LogOut, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

interface UserProfile {
  id: string
  email: string
  name: string
  studentId: string
  studentName: string
  role: 'STUDENT' | 'ADMIN' | 'TEACHER'
}

interface AttendanceRecord {
  id: string
  date: string
  status: 'PRESENT' | 'ABSENT' | 'LATE'
  markedAt: string
  sessionName?: string
}

interface AttendanceSession {
  id: string
  name: string
  date: string
  startTime: string
  endTime: string
  isActive: boolean
}

export default function AttendancePage() {
  const router = useRouter()
  const [user, setUser] = useState<UserProfile | null>(null)
  const [currentSession, setCurrentSession] = useState<AttendanceSession | null>(null)
  const [recentAttendance, setRecentAttendance] = useState<AttendanceRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [marking, setMarking] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [todayAttendance, setTodayAttendance] = useState<AttendanceRecord | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      
      // Check authentication and load user profile
      const profileResponse = await fetch('/api/auth/profile')
      if (!profileResponse.ok) {
        router.push('/')
        return
      }
      
      const userData = await profileResponse.json()
      
      // Check if profile is complete
      if (!userData.studentId || !userData.studentName) {
        router.push('/profile')
        return
      }
      
      setUser(userData)

      // Load current active session
      const sessionResponse = await fetch('/api/attendance/current-session')
      if (sessionResponse.ok) {
        const sessionData = await sessionResponse.json()
        setCurrentSession(sessionData)
      }

      // Load recent attendance records
      const attendanceResponse = await fetch('/api/attendance/my-records')
      if (attendanceResponse.ok) {
        const attendanceData = await attendanceResponse.json()
        setRecentAttendance(attendanceData.records || [])
        setTodayAttendance(attendanceData.todayRecord || null)
      }

    } catch (err) {
      console.error('Failed to load data:', err)
      setError("Failed to load attendance data")
    } finally {
      setLoading(false)
    }
  }

  const handleMarkAttendance = async () => {
    if (!currentSession) {
      setError("No active session available")
      return
    }

    if (todayAttendance) {
      setError("You have already marked attendance for today")
      return
    }

    setMarking(true)
    setError("")
    setSuccess("")

    try {
      const response = await fetch('/api/attendance/mark', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId: currentSession.id,
        }),
      })

      if (response.ok) {
        const result = await response.json()
        setSuccess(`Attendance marked successfully! Status: ${result.status}`)
        
        // Reload data to update the UI
        await loadData()
      } else {
        const errorData = await response.json()
        setError(errorData.error || "Failed to mark attendance")
      }
    } catch (err) {
      console.error('Failed to mark attendance:', err)
      setError("Network error. Please try again.")
    } finally {
      setMarking(false)
    }
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      router.push('/')
    } catch (err) {
      console.error('Logout failed:', err)
      router.push('/')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PRESENT':
        return 'success'
      case 'LATE':
        return 'warning'
      case 'ABSENT':
        return 'destructive'
      default:
        return 'default'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user) {
    return null // Will redirect
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-center mb-8"
        >
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Attendance System
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              Welcome back, {user.studentName}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={loadData}
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
            <Button
              variant="outline"
              onClick={handleLogout}
              className="flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </motion.div>

        <div className="max-w-4xl mx-auto space-y-6">
          {/* Student Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Student Information
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Student ID</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">{user.studentId}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Student Name</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">{user.studentName}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Email</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">{user.email}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Current Session & Attendance Marking */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Current Session
                </CardTitle>
                <CardDescription>
                  {new Date().toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {currentSession ? (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Session Name</p>
                        <p className="text-lg font-semibold text-gray-900 dark:text-white">{currentSession.name}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Start Time</p>
                        <p className="text-lg font-semibold text-gray-900 dark:text-white">
                          {new Date(currentSession.startTime).toLocaleTimeString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-300">End Time</p>
                        <p className="text-lg font-semibold text-gray-900 dark:text-white">
                          {new Date(currentSession.endTime).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>

                    <Separator />

                    {todayAttendance ? (
                      <div className="text-center py-8">
                        <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                          Attendance Already Marked
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300 mb-4">
                          You marked your attendance at {new Date(todayAttendance.markedAt).toLocaleTimeString()}
                        </p>
                        <Badge variant={getStatusColor(todayAttendance.status)} className="text-lg px-4 py-2">
                          {todayAttendance.status}
                        </Badge>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Calendar className="h-16 w-16 text-blue-500 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                          Mark Your Attendance
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300 mb-6">
                          Click the button below to mark your attendance for today's session
                        </p>
                        <Button
                          onClick={handleMarkAttendance}
                          disabled={marking}
                          size="lg"
                          className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 text-lg"
                        >
                          {marking ? (
                            <>
                              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                              Marking...
                            </>
                          ) : (
                            <>
                              <CheckCircle className="h-5 w-5 mr-2" />
                              Mark Attendance
                            </>
                          )}
                        </Button>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-8">
                    <Clock className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                      No Active Session
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      There is no active attendance session at the moment. Please check back later.
                    </p>
                  </div>
                )}

                {error && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="p-4 bg-red-50 border border-red-200 rounded-md"
                  >
                    <p className="text-sm text-red-600">{error}</p>
                  </motion.div>
                )}

                {success && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="p-4 bg-green-50 border border-green-200 rounded-md"
                  >
                    <p className="text-sm text-green-600">{success}</p>
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Recent Attendance History */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Recent Attendance History</CardTitle>
                <CardDescription>
                  Your attendance records for the past sessions
                </CardDescription>
              </CardHeader>
              <CardContent>
                {recentAttendance.length > 0 ? (
                  <div className="space-y-3">
                    {recentAttendance.map((record) => (
                      <div
                        key={record.id}
                        className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <Calendar className="h-4 w-4 text-gray-500" />
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {new Date(record.date).toLocaleDateString()}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-300">
                              {record.sessionName || 'Regular Session'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm text-gray-600 dark:text-gray-300">
                            {new Date(record.markedAt).toLocaleTimeString()}
                          </span>
                          <Badge variant={getStatusColor(record.status)}>
                            {record.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-300">
                      No attendance records found. Start marking your attendance to see your history here.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
