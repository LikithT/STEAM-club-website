// Simple Attendance System with Master Key Access
class AttendanceSystem {
    constructor() {
        this.attendanceRecords = JSON.parse(localStorage.getItem('attendanceRecords')) || [];
        this.isAdminAuthenticated = false;
        this.masterKey = 'Pagani'; // Master key for admin access
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.initMobileNavigation();
        this.initCursorEffects();
        this.setCurrentDate();
        this.updateAttendanceStats();
    }

    // Set current date in the form
    setCurrentDate() {
        const dateInput = document.getElementById('meetingDate');
        if (dateInput) {
            const today = new Date().toISOString().split('T')[0];
            dateInput.value = today;
        }
    }

    // Submit attendance
    submitAttendance(event) {
        event.preventDefault();
        
        const studentId = document.getElementById('studentId').value.trim();
        const studentName = document.getElementById('studentName').value.trim();
        const meetingDate = document.getElementById('meetingDate').value;

        if (!studentId || !studentName) {
            this.showNotification('Please fill in all required fields', 'error');
            return;
        }

        // Check for duplicate attendance for the same day
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
            id: Date.now().toString(),
            timestamp: new Date().toISOString(),
            date: new Date().toLocaleDateString(),
            time: new Date().toLocaleTimeString(),
            studentId: studentId,
            studentName: studentName,
            meetingDate: meetingDate
        };

        // Save to localStorage
        this.attendanceRecords.push(attendanceRecord);
        localStorage.setItem('attendanceRecords', JSON.stringify(this.attendanceRecords));

        // Show success message
        this.showSuccessMessage(attendanceRecord);
        
        // Clear form
        document.getElementById('attendanceForm').reset();
        this.setCurrentDate();
        this.updateAttendanceStats();
    }

    // Show success message
    showSuccessMessage(record) {
        const attendanceCard = document.getElementById('attendanceCard');
        const successCard = document.getElementById('successCard');
        const attendanceDetails = document.getElementById('attendanceDetails');

        attendanceDetails.innerHTML = `
            <div class="success-details">
                <p><strong>Student ID:</strong> ${record.studentId}</p>
                <p><strong>Name:</strong> ${record.studentName}</p>
                <p><strong>Date:</strong> ${record.date}</p>
                <p><strong>Time:</strong> ${record.time}</p>
            </div>
        `;

        attendanceCard.style.display = 'none';
        successCard.style.display = 'block';
        
        // Add animation to the reward image
        setTimeout(() => {
            const rewardImage = document.getElementById('rewardCarImage');
            if (rewardImage) {
                rewardImage.style.opacity = '0';
                rewardImage.style.transform = 'scale(0.8) translateY(20px)';
                rewardImage.style.transition = 'all 0.6s ease-out';
                
                setTimeout(() => {
                    rewardImage.style.opacity = '1';
                    rewardImage.style.transform = 'scale(1) translateY(0)';
                }, 300);
            }
        }, 100);
        
        this.showNotification('Attendance recorded successfully!', 'success');
    }

    // Go back to attendance form
    backToForm() {
        const attendanceCard = document.getElementById('attendanceCard');
        const successCard = document.getElementById('successCard');
        
        attendanceCard.style.display = 'block';
        successCard.style.display = 'none';
    }

    // Master key authentication
    authenticateAdmin() {
        const masterKeyInput = document.getElementById('masterKey');
        const enteredKey = masterKeyInput.value.trim();

        if (enteredKey === this.masterKey || enteredKey === this.masterKey.toLowerCase()) {
            this.isAdminAuthenticated = true;
            this.showAdminPanel();
            masterKeyInput.value = '';
            this.showNotification('Admin access granted', 'success');
        } else {
            this.showNotification('Invalid master key', 'error');
            masterKeyInput.value = '';
        }
    }

    // Show admin panel
    showAdminPanel() {
        const masterKeyCard = document.getElementById('masterKeyCard');
        const adminCard = document.getElementById('adminCard');
        
        masterKeyCard.style.display = 'none';
        adminCard.style.display = 'block';
        
        this.updateAttendanceStats();
        adminCard.scrollIntoView({ behavior: 'smooth' });
    }

    // View all records
    viewAllRecords() {
        const recordsSection = document.getElementById('recordsSection');
        
        if (recordsSection.style.display === 'none' || !recordsSection.style.display) {
            recordsSection.style.display = 'block';
            this.displayAttendanceTable();
        } else {
            recordsSection.style.display = 'none';
        }
    }

    // Display attendance table
    displayAttendanceTable() {
        const tableBody = document.getElementById('recordsTableBody');
        tableBody.innerHTML = '';

        if (this.attendanceRecords.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="5" class="no-records">No attendance records found</td></tr>';
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
                <td>-</td>
            `;
            tableBody.appendChild(row);
        });
    }

    // Format meeting type for display
    formatMeetingType(type) {
        const types = {
            'regular': 'Regular Meeting',
            'workshop': 'Workshop',
            'competition': 'Competition Prep',
            'build': 'Build Session',
            'field-trip': 'Field Trip',
            'other': 'Other'
        };
        return types[type] || type;
    }

    // Export to Excel
    downloadExcelReport() {
        if (this.attendanceRecords.length === 0) {
            this.showNotification('No attendance records to export', 'error');
            return;
        }

        // Create workbook
        const wb = XLSX.utils.book_new();
        
        // Prepare data
        const wsData = [
            ['Date', 'Time', 'Student ID', 'Student Name', 'Meeting Date']
        ];
        
        this.attendanceRecords.forEach(record => {
            wsData.push([
                record.date,
                record.time,
                record.studentId,
                record.studentName,
                record.meetingDate
            ]);
        });

        // Create worksheet
        const ws = XLSX.utils.aoa_to_sheet(wsData);
        
        // Auto-size columns
        const colWidths = [
            { wch: 12 }, // Date
            { wch: 10 }, // Time
            { wch: 12 }, // Student ID
            { wch: 20 }, // Student Name
            { wch: 12 }  // Meeting Date
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

    // Clear all data
    clearAllData() {
        if (confirm('Are you sure you want to clear all attendance data? This action cannot be undone.')) {
            this.attendanceRecords = [];
            localStorage.removeItem('attendanceRecords');
            this.updateAttendanceStats();
            this.displayAttendanceTable();
            this.showNotification('All attendance data cleared', 'success');
        }
    }

    // Update attendance statistics
    updateAttendanceStats() {
        const totalRecords = this.attendanceRecords.length;
        const uniqueStudents = new Set(this.attendanceRecords.map(record => record.studentId)).size;
        
        // Calculate this week's records
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        const thisWeekRecords = this.attendanceRecords.filter(record => 
            new Date(record.timestamp) >= oneWeekAgo
        ).length;

        const totalRecordsEl = document.getElementById('totalRecords');
        const uniqueStudentsEl = document.getElementById('uniqueStudents');
        const thisWeekRecordsEl = document.getElementById('thisWeekRecords');

        if (totalRecordsEl) totalRecordsEl.textContent = totalRecords;
        if (uniqueStudentsEl) uniqueStudentsEl.textContent = uniqueStudents;
        if (thisWeekRecordsEl) thisWeekRecordsEl.textContent = thisWeekRecords;
    }

    // Setup event listeners
    setupEventListeners() {
        // Attendance form submission
        const attendanceForm = document.getElementById('attendanceForm');
        if (attendanceForm) {
            attendanceForm.addEventListener('submit', (e) => this.submitAttendance(e));
        }

        // Back button
        const backBtn = document.getElementById('backBtn');
        if (backBtn) {
            backBtn.addEventListener('click', () => this.backToForm());
        }

        // Master key authentication
        const masterKeyBtn = document.getElementById('masterKeyBtn');
        if (masterKeyBtn) {
            masterKeyBtn.addEventListener('click', () => this.authenticateAdmin());
        }

        // Master key input - allow Enter key
        const masterKeyInput = document.getElementById('masterKey');
        if (masterKeyInput) {
            masterKeyInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.authenticateAdmin();
                }
            });
        }

        // Admin controls
        const downloadExcelBtn = document.getElementById('downloadExcelBtn');
        if (downloadExcelBtn) {
            downloadExcelBtn.addEventListener('click', () => this.downloadExcelReport());
        }

        const viewRecordsBtn = document.getElementById('viewRecordsBtn');
        if (viewRecordsBtn) {
            viewRecordsBtn.addEventListener('click', () => this.viewAllRecords());
        }

        const clearDataBtn = document.getElementById('clearDataBtn');
        if (clearDataBtn) {
            clearDataBtn.addEventListener('click', () => this.clearAllData());
        }

        // Form validation
        const studentIdInput = document.getElementById('studentId');
        const studentNameInput = document.getElementById('studentName');

        if (studentIdInput) {
            studentIdInput.addEventListener('input', (e) => {
                // Allow only alphanumeric characters
                e.target.value = e.target.value.replace(/[^a-zA-Z0-9]/g, '');
            });
        }

        if (studentNameInput) {
            studentNameInput.addEventListener('input', (e) => {
                // Allow only letters and spaces
                e.target.value = e.target.value.replace(/[^a-zA-Z\s]/g, '');
            });
        }
    }

    // Mobile navigation
    initMobileNavigation() {
        const mobileNavToggle = document.getElementById('mobileNavToggle');
        const mobileNavMenu = document.getElementById('mobileNavMenu');

        if (mobileNavToggle && mobileNavMenu) {
            mobileNavToggle.addEventListener('click', () => {
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
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-icon">${type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️'}</span>
                <span class="notification-message">${message}</span>
            </div>
        `;

        // Add styles
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#2196F3'};
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 10000;
            transform: translateX(400px);
            transition: transform 0.3s ease;
            max-width: 300px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        `;

        document.body.appendChild(notification);

        // Show notification
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);

        // Hide notification after 5 seconds
        setTimeout(() => {
            notification.style.transform = 'translateX(400px)';
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 5000);
    }
}

// Initialize attendance system when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.attendanceSystem = new AttendanceSystem();
});
