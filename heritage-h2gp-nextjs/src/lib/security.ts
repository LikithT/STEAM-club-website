import { NextRequest } from 'next/server'
import crypto from 'crypto'

// CSRF Token Management
export class CSRFProtection {
  private static readonly TOKEN_LENGTH = 32
  private static readonly TOKEN_HEADER = 'x-csrf-token'
  private static readonly TOKEN_COOKIE = 'csrf-token'

  static generateToken(): string {
    return crypto.randomBytes(this.TOKEN_LENGTH).toString('hex')
  }

  static validateToken(request: NextRequest, token: string): boolean {
    const headerToken = request.headers.get(this.TOKEN_HEADER)
    const cookieToken = request.cookies.get(this.TOKEN_COOKIE)?.value

    if (!headerToken || !cookieToken) {
      return false
    }

    // Use timing-safe comparison to prevent timing attacks
    return this.timingSafeEqual(headerToken, token) && 
           this.timingSafeEqual(cookieToken, token)
  }

  private static timingSafeEqual(a: string, b: string): boolean {
    if (a.length !== b.length) {
      return false
    }

    let result = 0
    for (let i = 0; i < a.length; i++) {
      result |= a.charCodeAt(i) ^ b.charCodeAt(i)
    }

    return result === 0
  }
}

// Rate Limiting
export class RateLimiter {
  private static requests = new Map<string, { count: number; resetTime: number }>()
  private static readonly WINDOW_MS = 15 * 60 * 1000 // 15 minutes
  private static readonly MAX_REQUESTS = 100 // requests per window

  static isAllowed(identifier: string): boolean {
    const now = Date.now()
    const record = this.requests.get(identifier)

    if (!record || now > record.resetTime) {
      // Reset or create new record
      this.requests.set(identifier, {
        count: 1,
        resetTime: now + this.WINDOW_MS
      })
      return true
    }

    if (record.count >= this.MAX_REQUESTS) {
      return false
    }

    record.count++
    return true
  }

  static getRemainingRequests(identifier: string): number {
    const record = this.requests.get(identifier)
    if (!record || Date.now() > record.resetTime) {
      return this.MAX_REQUESTS
    }
    return Math.max(0, this.MAX_REQUESTS - record.count)
  }

  static getResetTime(identifier: string): number {
    const record = this.requests.get(identifier)
    if (!record || Date.now() > record.resetTime) {
      return Date.now() + this.WINDOW_MS
    }
    return record.resetTime
  }

  // Clean up expired records periodically
  static cleanup(): void {
    const now = Date.now()
    for (const [key, record] of this.requests.entries()) {
      if (now > record.resetTime) {
        this.requests.delete(key)
      }
    }
  }
}

// Input Validation and Sanitization
export class InputValidator {
  static sanitizeString(input: string): string {
    return input
      .trim()
      .replace(/[<>]/g, '') // Remove potential HTML tags
      .substring(0, 1000) // Limit length
  }

  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email) && email.length <= 254
  }

  static isValidStudentId(studentId: string): boolean {
    // Allow alphanumeric characters, hyphens, and underscores
    const studentIdRegex = /^[a-zA-Z0-9_-]{1,20}$/
    return studentIdRegex.test(studentId)
  }

  static isValidName(name: string): boolean {
    // Allow letters, spaces, hyphens, and apostrophes
    const nameRegex = /^[a-zA-Z\s'-]{1,100}$/
    return nameRegex.test(name)
  }

  static isValidSessionName(name: string): boolean {
    // Allow letters, numbers, spaces, and common punctuation
    const sessionNameRegex = /^[a-zA-Z0-9\s\-_.,()]{1,100}$/
    return sessionNameRegex.test(name)
  }

  static isValidDate(dateString: string): boolean {
    const date = new Date(dateString)
    return date instanceof Date && !isNaN(date.getTime())
  }

  static isValidUUID(uuid: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    return uuidRegex.test(uuid)
  }
}

// Security Headers
export class SecurityHeaders {
  static getSecurityHeaders(): Record<string, string> {
    return {
      // Prevent XSS attacks
      'X-XSS-Protection': '1; mode=block',
      
      // Prevent MIME type sniffing
      'X-Content-Type-Options': 'nosniff',
      
      // Prevent clickjacking
      'X-Frame-Options': 'DENY',
      
      // Enforce HTTPS
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
      
      // Content Security Policy
      'Content-Security-Policy': [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://accounts.google.com https://apis.google.com",
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
        "font-src 'self' https://fonts.gstatic.com",
        "img-src 'self' data: https:",
        "connect-src 'self' https://accounts.google.com https://www.googleapis.com",
        "frame-src https://accounts.google.com"
      ].join('; '),
      
      // Referrer Policy
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      
      // Permissions Policy
      'Permissions-Policy': [
        'camera=()',
        'microphone=()',
        'geolocation=()',
        'payment=()',
        'usb=()'
      ].join(', ')
    }
  }
}

// IP Address utilities
export class IPUtils {
  static getClientIP(request: NextRequest): string {
    // Check various headers for the real IP address
    const forwarded = request.headers.get('x-forwarded-for')
    const realIP = request.headers.get('x-real-ip')
    const cfConnectingIP = request.headers.get('cf-connecting-ip')
    
    if (forwarded) {
      // x-forwarded-for can contain multiple IPs, take the first one
      return forwarded.split(',')[0].trim()
    }
    
    if (realIP) {
      return realIP
    }
    
    if (cfConnectingIP) {
      return cfConnectingIP
    }
    
    // Fallback for unknown IP
    return 'unknown'
  }

  static isValidIP(ip: string): boolean {
    // Basic IP validation (IPv4 and IPv6)
    const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/
    const ipv6Regex = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/
    
    return ipv4Regex.test(ip) || ipv6Regex.test(ip)
  }
}

// Session Security
export class SessionSecurity {
  static readonly SESSION_TIMEOUT = 7 * 24 * 60 * 60 * 1000 // 7 days
  static readonly REFRESH_THRESHOLD = 24 * 60 * 60 * 1000 // 1 day

  static shouldRefreshToken(tokenIssuedAt: number): boolean {
    const now = Date.now()
    const tokenAge = now - tokenIssuedAt
    return tokenAge > this.REFRESH_THRESHOLD
  }

  static isTokenExpired(tokenIssuedAt: number): boolean {
    const now = Date.now()
    const tokenAge = now - tokenIssuedAt
    return tokenAge > this.SESSION_TIMEOUT
  }

  static generateSecureSessionId(): string {
    return crypto.randomBytes(32).toString('hex')
  }
}

// Audit Logging
export interface AuditLogEntry {
  userId: string
  action: string
  details: string
  ipAddress: string
  userAgent: string
  timestamp: Date
  success: boolean
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH'
}

export class AuditLogger {
  static createLogEntry(
    userId: string,
    action: string,
    details: string,
    request: NextRequest,
    success: boolean = true,
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' = 'LOW'
  ): AuditLogEntry {
    return {
      userId,
      action,
      details,
      ipAddress: IPUtils.getClientIP(request),
      userAgent: request.headers.get('user-agent') || 'unknown',
      timestamp: new Date(),
      success,
      riskLevel
    }
  }

  static getHighRiskActions(): string[] {
    return [
      'ADMIN_LOGIN',
      'ROLE_CHANGE',
      'USER_DELETE',
      'BULK_EXPORT',
      'SYSTEM_CONFIG_CHANGE',
      'FAILED_LOGIN_ATTEMPT'
    ]
  }

  static determineRiskLevel(action: string, success: boolean): 'LOW' | 'MEDIUM' | 'HIGH' {
    if (!success) {
      return 'MEDIUM'
    }

    if (this.getHighRiskActions().includes(action)) {
      return 'HIGH'
    }

    if (action.includes('EXPORT') || action.includes('DELETE')) {
      return 'MEDIUM'
    }

    return 'LOW'
  }
}

// Password Security (for future use if needed)
export class PasswordSecurity {
  static readonly MIN_LENGTH = 8
  static readonly SALT_ROUNDS = 12

  static validatePasswordStrength(password: string): {
    isValid: boolean
    errors: string[]
  } {
    const errors: string[] = []

    if (password.length < this.MIN_LENGTH) {
      errors.push(`Password must be at least ${this.MIN_LENGTH} characters long`)
    }

    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter')
    }

    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter')
    }

    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number')
    }

    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      errors.push('Password must contain at least one special character')
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }
}
