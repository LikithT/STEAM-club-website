"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Lock, Eye, EyeOff, Shield, Users, Calendar, Download, BarChart3 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

interface AttendanceRecord {
  id: string
  studentId: string
  studentName: string
  email: string
  sessionName: string
  sessionDate: string
  status: 'PRESENT' | 'ABSENT' | 'LATE'
  markedAt: string
}

interface AttendanceSession {
  id: string
  name: string
  date: string
  startTime: string
  endTime: string
  isActive: boolean
  attendanceCount: number
}

export default function AdminPage() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [masterKey, setMasterKey] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  
  // Admin dashboard data
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([])
  const [sessions, setSessions] = useState<AttendanceSession[]>([])
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalSessions: 0,
    totalAttendance: 0,
    averageAttendance: 0
  })

  useEffect(() => {
    // Check if already authenticated
    const authStatus = localStorage.getItem('admin_authenticated')
    if (authStatus === 'true') {
      setIsAuthenticated(true)
      loadDashboardData()
    }
  }, [])

  const handleMasterKeyAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    // Check master key
    if (masterKey === "H2GP" || masterKey === "h2gp") {
      setIsAuthenticated(true)
      localStorage.setItem('admin_authenticated', 'true')
      localStorage.setItem('admin_master_key', masterKey)
      await loadDashboardData()
    } else {
      setError("Invalid master key. Access denied.")
    }
    
    setLoading(false)
  }

  const loadDashboardData = async () => {
    try {
      const masterKey = localStorage.getItem('admin_master_key') || 'H2GP'
      
      // Load attendance records
      const attendanceResponse = await fetch('/.netlify/functions/admin/attendance-records', {
        headers: {
          'X-Master-Key': masterKey
        }
      })
      if (attendanceResponse.ok) {
        const attendanceData = await attendanceResponse.json()
        setAttendanceRecords(attendanceData)
      }

      // Load sessions
      const sessionsResponse = await fetch('/.netlify/functions/admin/sessions', {
        headers: {
          'X-Master-Key': masterKey
        }
      })
      if (sessionsResponse.ok) {
        const sessionsData = await sessionsResponse.json()
        setSessions(sessionsData)
      }

      // Load stats
      const statsResponse = await fetch('/.netlify/functions/admin/stats', {
        headers: {
          'X-Master-Key': masterKey
        }
      })
      if (statsResponse.ok) {
        const statsData = await statsResponse.json()
        setStats(statsData)
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error)
    }
  }

  const handleExportData = async (format: 'excel' | 'csv') => {
    try {
      const masterKey = localStorage.getItem('admin_master_key') || 'H2GP'
      const response = await fetch(`/.netlify/functions/export/attendance?format=${format}`, {
        headers: {
          'X-Master-Key': masterKey
        }
      })
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `attendance_export_${new Date().toISOString().split('T')[0]}.${format === 'excel' ? 'xlsx' : 'csv'}`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      }
    } catch (error) {
      console.error('Export failed:', error)
    }
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    localStorage.removeItem('admin_authenticated')
    localStorage.removeItem('admin_master_key')
    setMasterKey("")
    router.push('/')
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

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="w-full max-w-md"
        >
          <Card className="shadow-2xl border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
            <CardHeader className="text-center pb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                Admin Access Required
              </CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-300">
                Enter the master key to access attendance tracking features
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <form onSubmit={handleMasterKeyAuth} className="space-y-6">
                <div className="space-y-2">
                  <label htmlFor="masterKey" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Master Key
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      id="masterKey"
                      type={showPassword ? "text" : "password"}
                      value={masterKey}
                      onChange={(e) => setMasterKey(e.target.value)}
                      placeholder="Enter master key"
                      className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {error && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="p-3 bg-red-50 border border-red-200 rounded-lg"
                  >
                    <p className="text-sm text-red-600">{error}</p>
                  </motion.div>
                )}

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white py-3 text-lg font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                  ) : (
                    <Shield className="h-5 w-5 mr-2" />
                  )}
                  {loading ? "Authenticating..." : "Access Admin Panel"}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <Button
                  variant="ghost"
                  onClick={() => router.push('/')}
                  className="text-gray-600 hover:text-gray-800 dark:text-gray-300 dark:hover:text-white"
                >
                  Back to Home
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-center mb-8"
        >
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Admin Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              Heritage H2GP Attendance Tracking System
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="destructive" className="px-3 py-1">
              <Shield className="h-4 w-4 mr-1" />
              Admin Access
            </Badge>
            <Button
              variant="outline"
              onClick={handleLogout}
              className="flex items-center gap-2"
            >
              Logout
            </Button>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            { title: "Total Students", value: stats.totalStudents, icon: Users, color: "text-blue-600" },
            { title: "Total Sessions", value: stats.totalSessions, icon: Calendar, color: "text-green-600" },
            { title: "Total Attendance", value: stats.totalAttendance, icon: BarChart3, color: "text-purple-600" },
            { title: "Avg Attendance", value: stats.averageAttendance, icon: BarChart3, color: "text-orange-600" }
          ].map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.1 }}
            >
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                        {stat.title}
                      </p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {stat.value}
                      </p>
                    </div>
                    <stat.icon className={`h-8 w-8 ${stat.color}`} />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Export Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mb-8"
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="h-5 w-5" />
                Export Data
              </CardTitle>
              <CardDescription>
                Download attendance records in Excel or CSV format
              </CardDescription>
            </CardHeader>
            <CardContent className="flex gap-4">
              <Button
                onClick={() => handleExportData('excel')}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <Download className="h-4 w-4 mr-2" />
                Export Excel
              </Button>
              <Button
                onClick={() => handleExportData('csv')}
                variant="outline"
              >
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Attendance Records */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Recent Attendance Records</CardTitle>
              <CardDescription>
                Latest attendance entries from students
              </CardDescription>
            </CardHeader>
            <CardContent>
              {attendanceRecords.length > 0 ? (
                <div className="space-y-4">
                  {attendanceRecords.slice(0, 10).map((record) => (
                    <div
                      key={record.id}
                      className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
                    >
                      <div className="flex items-center gap-4">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {record.studentName}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            {record.studentId} • {record.email}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {record.sessionName}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            {new Date(record.markedAt).toLocaleString()}
                          </p>
                        </div>
                        <Badge variant={getStatusColor(record.status)}>
                          {record.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-300">
                    No attendance records found
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
