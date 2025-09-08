// Google Sheets Integration for Attendance System
class AttendanceSystem {
    constructor() {
        this.isAuthenticated = false;
        this.currentUser = null;
        this.attendanceRecords = JSON.parse(localStorage.getItem('attendanceRecords')) || [];
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.initMobileNavigation();
        this.initCursorEffects();
        this.loadGoogleSheetsAPI();
    }

    // Load Google Sheets API
    loadGoogleSheetsAPI() {
        const script = document.createElement('script');
        script.src = 'https://apis.google.com/js/api.js';
        script.onload = () => {
            gapi.load('client:auth2', () => {
                this.initGoogleAPI();
            });
        };
        document.head.appendChild(script);
    }

    // Initialize Google API
    async initGoogleAPI() {
        try {
            await gapi.client.init({
                apiKey: 'YOUR_API_KEY', // Replace with your Google API key
                clientId: 'YOUR_CLIENT_ID', // Replace with your Google OAuth client ID
                discoveryDocs: ['https://sheets.googleapis.com/$discovery/rest?version=v4'],
                scope: 'https://www.googleapis.com/auth/spreadsheets'
            });

            // Check if user is already signed in
            const authInstance = gapi.auth2.getAuthInstance();
            if (authInstance.isSignedIn.get()) {
                this.handleAuthSuccess(authInstance.currentUser.get());
            }
        } catch (error) {
            console.log('Google API initialization failed, using local storage fallback');
            this.showNotification('Using local storage for attendance tracking', 'info');
        }
    }

    // Google OAuth Sign In
    async signInWithGoogle() {
        try {
            const authInstance = gapi.auth2.getAuthInstance();
            const user = await authInstance.signIn();
            this.handleAuthSuccess(user);
        } catch (error) {
            console.error('Google sign-in failed:', error);
            // Fallback to demo mode
            this.simulateGoogleAuth();
        }
    }

    // Simulate Google Auth for demo purposes
    simulateGoogleAuth() {
        const demoUsers = [
            { name: 'John Smith', email: 'john.smith@student.edu', id: 'demo_user_1' },
            { name: 'Sarah Johnson', email: 'sarah.johnson@student.edu', id: 'demo_user_2' },
            { name: 'Mike Chen', email: 'mike.chen@student.edu', id: 'demo_user_3' },
            { name: 'Emily Davis', email: 'emily.davis@student.edu', id: 'demo_user_4' }
        ];
        
        const randomUser = demoUsers[Math.floor(Math.random() * demoUsers.length)];
        this.handleAuthSuccess({
            getBasicProfile: () => ({
                getName: () => randomUser.name,
                getEmail: () => randomUser.email,
                getId: () => randomUser.id
            })
        });
    }

    // Handle successful authentication
    handleAuthSuccess(user) {
        const profile = user.getBasicProfile();
        this.isAuthenticated = true;
        this.currentUser = {
            name: profile.getName(),
            email: profile.getEmail(),
            id: profile.getId()
        };

        this.updateAuthUI();
        this.showNotification(`Welcome, ${this.currentUser.name}!`, 'success');
    }

    // Update authentication UI
    updateAuthUI() {
        const authSection = document.getElementById('authSection');
        const attendanceForm = document.getElementById('attendanceForm');
        const userInfo = document.getElementById('userInfo');

        if (this.isAuthenticated) {
            authSection.style.display = 'none';
            attendanceForm.style.display = 'block';
            userInfo.innerHTML = `
                <div class="user-profile">
                    <div class="user-avatar">${this.currentUser.name.charAt(0)}</div>
                    <div class="user-details">
                        <h3>${this.currentUser.name}</h3>
                        <p>${this.currentUser.email}</p>
                    </div>
                    <button class="sign-out-btn" onclick="attendanceSystem.signOut()">Sign Out</button>
                </div>
            `;
        } else {
            authSection.style.display = 'block';
            attendanceForm.style.display = 'none';
            userInfo.innerHTML = '';
        }
    }

    // Sign out
    async signOut() {
        try {
            const authInstance = gapi.auth2.getAuthInstance();
            await authInstance.signOut();
        } catch (error) {
            console.log('Google sign-out failed, clearing local session');
        }
        
        this.isAuthenticated = false;
        this.currentUser = null;
        this.updateAuthUI();
        this.showNotification('Signed out successfully', 'success');
    }

    // Submit attendance to Google Sheets
    async submitAttendance() {
        const studentId = document.getElementById('studentId').value.trim();
        const studentName = document.getElementById('studentName').value.trim();
        const meetingType = document.getElementById('meetingType').value;
        const notes = document.getElementById('notes').value.trim();

        if (!studentId || !studentName) {
            this.showNotification('Please fill in all required fields', 'error');
            return;
        }

        // Check for duplicate attendance
        const today = new Date().toDateString();
        const existingRecord = this.attendanceRecords.find(record => 
            record.studentId === studentId && 
            new Date(record.timestamp).toDateString() === today
        );

        if (existingRecord) {
            this.showNotification('Attendance already recorded for today', 'error');
            return;
        }

        const attendanceRecord = {
            timestamp: new Date().toISOString(),
            date: new Date().toLocaleDateString(),
            time: new Date().toLocaleTimeString(),
            studentId: studentId,
            studentName: studentName,
            meetingType: meetingType,
            notes: notes,
            submittedBy: this.currentUser.name,
            submittedByEmail: this.currentUser.email
        };

        try {
            // Try to submit to Google Sheets
            await this.submitToGoogleSheets(attendanceRecord);
            this.showNotification('Attendance submitted to Google Sheets successfully!', 'success');
        } catch (error) {
            console.error('Google Sheets submission failed:', error);
            // Fallback to local storage
            this.attendanceRecords.push(attendanceRecord);
            localStorage.setItem('attendanceRecords', JSON.stringify(this.attendanceRecords));
            this.showNotification('Attendance saved locally (Google Sheets unavailable)', 'info');
        }

        // Clear form
        document.getElementById('attendanceFormElement').reset();
        this.updateAttendanceStats();
    }

    // Submit to Google Sheets
    async submitToGoogleSheets(record) {
        const SPREADSHEET_ID = 'YOUR_SPREADSHEET_ID'; // Replace with your Google Sheets ID
        const RANGE = 'Sheet1!A:H'; // Adjust range as needed

        const values = [
            [
                record.timestamp,
                record.date,
                record.time,
                record.studentId,
                record.studentName,
                record.meetingType,
                record.notes,
                record.submittedBy
            ]
        ];

        const body = {
            values: values
        };

        const response = await gapi.client.sheets.spreadsheets.values.append({
            spreadsheetId: SPREADSHEET_ID,
            range: RANGE,
            valueInputOption: 'RAW',
            resource: body
        });

        return response;
    }

    // Create Google Sheets spreadsheet (for setup)
    async createAttendanceSpreadsheet() {
        try {
            const response = await gapi.client.sheets.spreadsheets.create({
                resource: {
                    properties: {
                        title: 'Heritage H2GP Attendance Tracker'
                    },
                    sheets: [{
                        properties: {
                            title: 'Attendance Records'
                        }
                    }]
                }
            });

            const spreadsheetId = response.result.spreadsheetId;
            
            // Add headers
            await gapi.client.sheets.spreadsheets.values.update({
                spreadsheetId: spreadsheetId,
                range: 'Sheet1!A1:H1',
                valueInputOption: 'RAW',
                resource: {
                    values: [['Timestamp', 'Date', 'Time', 'Student ID', 'Student Name', 'Meeting Type', 'Notes', 'Submitted By']]
                }
            });

            this.showNotification(`Spreadsheet created! ID: ${spreadsheetId}`, 'success');
            return spreadsheetId;
        } catch (error) {
            console.error('Failed to create spreadsheet:', error);
            throw error;
        }
    }

    // Export to Excel (fallback option)
    exportToExcel() {
        if (this.attendanceRecords.length === 0) {
            this.showNotification('No attendance records to export', 'error');
            return;
        }

        // Create workbook
        const wb = XLSX.utils.book_new();
        
        // Prepare data
        const wsData = [
            ['Timestamp', 'Date', 'Time', 'Student ID', 'Student Name', 'Meeting Type', 'Notes', 'Submitted By']
        ];
        
        this.attendanceRecords.forEach(record => {
            wsData.push([
                record.timestamp,
                record.date,
                record.time,
                record.studentId,
                record.studentName,
                record.meetingType,
                record.notes,
                record.submittedBy
            ]);
        });

        // Create worksheet
        const ws = XLSX.utils.aoa_to_sheet(wsData);
        
        // Auto-size columns
        const colWidths = [
            { wch: 20 }, // Timestamp
            { wch: 12 }, // Date
            { wch: 10 }, // Time
            { wch: 12 }, // Student ID
            { wch: 20 }, // Student Name
            { wch: 15 }, // Meeting Type
            { wch: 30 }, // Notes
            { wch: 20 }  // Submitted By
        ];
        ws['!cols'] = colWidths;

        // Add worksheet to workbook
        XLSX.utils.book_append_sheet(wb, ws, 'Attendance Records');

        // Generate filename with current date
        const filename = `Heritage_H2GP_Attendance_${new Date().toISOString().split('T')[0]}.xlsx`;
        
        // Save file
        XLSX.writeFile(wb, filename);
        
        this.showNotification(`Attendance exported to ${filename}`, 'success');
    }

    // Update attendance statistics
    updateAttendanceStats() {
        const totalRecords = this.attendanceRecords.length;
        const todayRecords = this.attendanceRecords.filter(record => 
            new Date(record.timestamp).toDateString() === new Date().toDateString()
        ).length;
        const uniqueStudents = new Set(this.attendanceRecords.map(record => record.studentId)).size;

        document.getElementById('totalAttendance').textContent = totalRecords;
        document.getElementById('todayAttendance').textContent = todayRecords;
        document.getElementById('uniqueStudents').textContent = uniqueStudents;
    }

    // View attendance records
    viewAttendanceRecords() {
        const recordsContainer = document.getElementById('attendanceRecords');
        const adminSection = document.getElementById('adminSection');
        
        if (recordsContainer.style.display === 'none' || !recordsContainer.style.display) {
            recordsContainer.style.display = 'block';
            adminSection.scrollIntoView({ behavior: 'smooth' });
            this.displayAttendanceTable();
        } else {
            recordsContainer.style.display = 'none';
        }
    }

    // Display attendance table
    displayAttendanceTable() {
        const tableBody = document.getElementById('attendanceTableBody');
        tableBody.innerHTML = '';

        if (this.attendanceRecords.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="7" class="no-records">No attendance records found</td></tr>';
            return;
        }

        // Sort records by timestamp (newest first)
        const sortedRecords = [...this.attendanceRecords].sort((a, b) => 
            new Date(b.timestamp) - new Date(a.timestamp)
        );

        sortedRecords.forEach(record => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${record.date}</td>
                <td>${record.time}</td>
                <td>${record.studentId}</td>
                <td>${record.studentName}</td>
                <td><span class="meeting-type-badge ${record.meetingType}">${record.meetingType}</span></td>
                <td>${record.notes || '-'}</td>
                <td>${record.submittedBy}</td>
            `;
            tableBody.appendChild(row);
        });
    }

    // Clear all attendance data
    clearAttendanceData() {
        if (confirm('Are you sure you want to clear all attendance data? This action cannot be undone.')) {
            this.attendanceRecords = [];
            localStorage.removeItem('attendanceRecords');
            this.updateAttendanceStats();
            this.displayAttendanceTable();
            this.showNotification('All attendance data cleared', 'success');
        }
    }

    // Setup event listeners
    setupEventListeners() {
        // Google Sign In
        document.getElementById('googleSignInBtn')?.addEventListener('click', () => {
            this.signInWithGoogle();
        });

        // Attendance form submission
        document.getElementById('submitAttendanceBtn')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.submitAttendance();
        });

        // Admin functions
        document.getElementById('viewRecordsBtn')?.addEventListener('click', () => {
            this.viewAttendanceRecords();
        });

        document.getElementById('exportExcelBtn')?.addEventListener('click', () => {
            this.exportToExcel();
        });

        document.getElementById('clearDataBtn')?.addEventListener('click', () => {
            this.clearAttendanceData();
        });

        // Form validation
        const studentIdInput = document.getElementById('studentId');
        const studentNameInput = document.getElementById('studentName');

        studentIdInput?.addEventListener('input', (e) => {
            // Allow only alphanumeric characters
            e.target.value = e.target.value.replace(/[^a-zA-Z0-9]/g, '');
        });

        studentNameInput?.addEventListener('input', (e) => {
            // Allow only letters and spaces
            e.target.value = e.target.value.replace(/[^a-zA-Z\s]/g, '');
        });
    }

    // Mobile navigation
    initMobileNavigation() {
        const mobileNavToggle = document.getElementById('mobileNavToggle');
        const mobileNavMenu = document.getElementById('mobileNavMenu');

        mobileNavToggle?.addEventListener('click', () => {
            mobileNavToggle.classList.toggle('active');
            mobileNavMenu.classList.toggle('active');
        });

        // Close mobile menu when clicking on links
        document.querySelectorAll('.mobile-nav-link').forEach(link => {
            link.addEventListener('click', () => {
                mobileNavToggle.classList.remove('active');
                mobileNavMenu.classList.remove('active');
            });
        });
    }

    // Cursor effects
    initCursorEffects() {
        const cursor = document.querySelector('.cursor');
        if (!cursor) return;

        document.addEventListener('mousemove', (e) => {
            cursor.style.left = e.clientX + 'px';
            cursor.style.top = e.clientY + 'px';
        });

        // Add hover effects for interactive elements
        document.querySelectorAll('button, a, input, select, textarea').forEach(element => {
            element.addEventListener('mouseenter', () => {
                cursor.classList.add('cursor-hover');
            });

            element.addEventListener('mouseleave', () => {
                cursor.classList.remove('cursor-hover');
            });
        });
    }

    // Show notification
    showNotification(message, type = 'info') {
        // Remove existing notifications
        const existingNotifications = document.querySelectorAll('.notification');
        existingNotifications.forEach(notification => notification.remove());

        // Create new notification
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;

        document.body.appendChild(notification);

        // Show notification
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);

        // Hide notification after 5 seconds
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 5000);
    }
}

// Initialize attendance system when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.attendanceSystem = new AttendanceSystem();
    
    // Load SheetJS library for Excel export
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js';
    document.head.appendChild(script);
});
