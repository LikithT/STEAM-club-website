// Student Attendance System with Excel Export
class StudentAttendanceSystem {
    constructor() {
        this.currentUser = null;
        this.attendanceRecords = JSON.parse(localStorage.getItem('h2gp_attendance_records')) || [];
        this.init();
    }

    init() {
        this.checkAuthentication();
        this.setupEventListeners();
        this.initCursorEffects();
        this.updateStats();
        this.loadGoogleSheetsAPI();
    }

    // Check if user is authenticated
    checkAuthentication() {
        const userData = sessionStorage.getItem('h2gp_user');
        if (!userData) {
            // Redirect to login if not authenticated
            window.location.href = 'login.html';
            return;
        }
        
        this.currentUser = JSON.parse(userData);
        this.displayUserInfo();
    }

    // Display user information in navigation
    displayUserInfo() {
        const userInfo = document.getElementById('userInfo');
        if (userInfo && this.currentUser) {
            userInfo.innerHTML = `
                <div class="nav-user-info">
                    <img src="${this.currentUser.picture}" alt="Profile" class="nav-profile-pic">
                    <div class="nav-user-details">
                        <span class="nav-user-name">${this.currentUser.name}</span>
                        <span class="nav-user-email">${this.currentUser.email}</span>
                    </div>
                    <button class="nav-logout-btn" onclick="studentAttendance.logout()">Sign Out</button>
                </div>
            `;
        }
    }

    // Load Google Sheets API
    loadGoogleSheetsAPI() {
        if (typeof gapi !== 'undefined') {
            gapi.load('client', () => {
                this.initGoogleSheetsClient();
            });
        }
    }

    // Initialize Google Sheets client
    async initGoogleSheetsClient() {
        try {
            await gapi.client.init({
                apiKey: 'YOUR_GOOGLE_API_KEY', // Replace with your API key
                discoveryDocs: ['https://sheets.googleapis.com/$discovery/rest?version=v4']
            });
            console.log('Google Sheets API initialized');
        } catch (error) {
            console.log('Google Sheets API initialization failed, using local storage only');
        }
    }

    // Submit attendance
    async submitAttendance(formData) {
        const studentId = formData.get('studentId').trim();
        const studentName = formData.get('studentName').trim();
        const meetingType = formData.get('meetingType');
        const grade = formData.get('grade');
        const notes = formData.get('notes').trim();

        // Validation
        if (!studentId || !studentName) {
            this.showNotification('Please fill in all required fields', 'error');
            return false;
        }

        // Check for duplicate attendance today
        const today = new Date().toDateString();
        const existingRecord = this.attendanceRecords.find(record => 
            record.studentId === studentId && 
            new Date(record.timestamp).toDateString() === today
        );

        if (existingRecord) {
            this.showNotification('Attendance already recorded for this student today', 'error');
            return false;
        }

        const attendanceRecord = {
            id: Date.now().toString(),
            timestamp: new Date().toISOString(),
            date: new Date().toLocaleDateString(),
            time: new Date().toLocaleTimeString(),
            studentId: studentId,
            studentName: studentName,
            meetingType: meetingType,
            grade: grade || 'Not specified',
            notes: notes || '',
            submittedBy: this.currentUser.name,
            submittedByEmail: this.currentUser.email,
            googleAccountId: this.currentUser.id
        };

        try {
            // Try to submit to Google Sheets first
            await this.submitToGoogleSheets(attendanceRecord);
            this.showNotification('Attendance submitted to Google Sheets successfully!', 'success');
        } catch (error) {
            console.error('Google Sheets submission failed:', error);
            this.showNotification('Google Sheets unavailable, saving locally', 'info');
        }

        // Always save locally as backup
        this.attendanceRecords.push(attendanceRecord);
        localStorage.setItem('h2gp_attendance_records', JSON.stringify(this.attendanceRecords));

        this.updateStats();
        this.showSuccessMessage(attendanceRecord);
        return true;
    }

    // Submit to Google Sheets
    async submitToGoogleSheets(record) {
        const SPREADSHEET_ID = 'YOUR_SPREADSHEET_ID'; // Replace with your spreadsheet ID
        const RANGE = 'Sheet1!A:J';

        const values = [
            [
                record.timestamp,
                record.date,
                record.time,
                record.studentId,
                record.studentName,
                record.grade,
                record.meetingType,
                record.notes,
                record.submittedBy,
                record.submittedByEmail
            ]
        ];

        const response = await gapi.client.sheets.spreadsheets.values.append({
            spreadsheetId: SPREADSHEET_ID,
            range: RANGE,
            valueInputOption: 'RAW',
            resource: { values: values }
        });

        return response;
    }

    // Show success message
    showSuccessMessage(record) {
        const formContainer = document.querySelector('.attendance-form-container');
        const successMessage = document.getElementById('successMessage');
        const successDetails = document.getElementById('successDetails');

        formContainer.style.display = 'none';
        successMessage.style.display = 'block';

        successDetails.innerHTML = `
            <div class="success-detail-item">
                <strong>Student ID:</strong> ${record.studentId}
            </div>
            <div class="success-detail-item">
                <strong>Name:</strong> ${record.studentName}
            </div>
            <div class="success-detail-item">
                <strong>Date & Time:</strong> ${record.date} at ${record.time}
            </div>
            <div class="success-detail-item">
                <strong>Meeting Type:</strong> ${record.meetingType}
            </div>
            ${record.grade !== 'Not specified' ? `
            <div class="success-detail-item">
                <strong>Grade:</strong> ${record.grade}
            </div>
            ` : ''}
            ${record.notes ? `
            <div class="success-detail-item">
                <strong>Notes:</strong> ${record.notes}
            </div>
            ` : ''}
        `;

        // Scroll to success message
        successMessage.scrollIntoView({ behavior: 'smooth' });
    }

    // Record new entry
    recordNewEntry() {
        const formContainer = document.querySelector('.attendance-form-container');
        const successMessage = document.getElementById('successMessage');
        
        successMessage.style.display = 'none';
        formContainer.style.display = 'block';
        
        this.clearForm();
        formContainer.scrollIntoView({ behavior: 'smooth' });
    }

    // Clear form
    clearForm() {
        const form = document.getElementById('attendanceForm');
        form.reset();
        
        // Reset any validation states
        const inputs = form.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            input.classList.remove('error', 'success');
        });
    }

    // Update statistics
    updateStats() {
        const today = new Date().toDateString();
        const todayRecords = this.attendanceRecords.filter(record => 
            new Date(record.timestamp).toDateString() === today
        );
        const totalRecords = this.attendanceRecords.length;
        const uniqueStudents = new Set(this.attendanceRecords.map(record => record.studentId)).size;

        // Update header stats
        document.getElementById('todayCount').textContent = todayRecords.length;
        document.getElementById('totalCount').textContent = totalRecords;

        // Update admin stats
        document.getElementById('adminTotalRecords').textContent = totalRecords;
        document.getElementById('adminUniqueStudents').textContent = uniqueStudents;
        document.getElementById('adminTodayRecords').textContent = todayRecords.length;
    }

    // View all data (admin panel)
    viewAllData() {
        const adminPanel = document.getElementById('adminPanel');
        adminPanel.style.display = 'block';
        this.populateAdminTable();
        adminPanel.scrollIntoView({ behavior: 'smooth' });
    }

    // Hide admin panel
    hideAdminPanel() {
        const adminPanel = document.getElementById('adminPanel');
        adminPanel.style.display = 'none';
    }

    // Populate admin table
    populateAdminTable() {
        const tableBody = document.getElementById('adminTableBody');
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
                <td>${record.grade}</td>
                <td><span class="meeting-type-badge ${record.meetingType}">${record.meetingType}</span></td>
                <td>${record.notes || '-'}</td>
            `;
            tableBody.appendChild(row);
        });
    }

    // Export to Excel
    exportToExcel() {
        if (this.attendanceRecords.length === 0) {
            this.showNotification('No attendance records to export', 'error');
            return;
        }

        try {
            // Create workbook
            const wb = XLSX.utils.book_new();
            
            // Prepare data with headers
            const wsData = [
                ['Timestamp', 'Date', 'Time', 'Student ID', 'Student Name', 'Grade', 'Meeting Type', 'Notes', 'Submitted By', 'Google Account']
            ];
            
            // Sort records by timestamp (newest first)
            const sortedRecords = [...this.attendanceRecords].sort((a, b) => 
                new Date(b.timestamp) - new Date(a.timestamp)
            );
            
            sortedRecords.forEach(record => {
                wsData.push([
                    record.timestamp,
                    record.date,
                    record.time,
                    record.studentId,
                    record.studentName,
                    record.grade,
                    record.meetingType,
                    record.notes || '',
                    record.submittedBy,
                    record.submittedByEmail
                ]);
            });

            // Create worksheet
            const ws = XLSX.utils.aoa_to_sheet(wsData);
            
            // Auto-size columns
            const colWidths = [
                { wch: 25 }, // Timestamp
                { wch: 12 }, // Date
                { wch: 10 }, // Time
                { wch: 15 }, // Student ID
                { wch: 25 }, // Student Name
                { wch: 10 }, // Grade
                { wch: 15 }, // Meeting Type
                { wch: 30 }, // Notes
                { wch: 20 }, // Submitted By
                { wch: 25 }  // Google Account
            ];
            ws['!cols'] = colWidths;

            // Add worksheet to workbook
            XLSX.utils.book_append_sheet(wb, ws, 'Attendance Records');

            // Generate filename with current date and time
            const now = new Date();
            const filename = `Heritage_H2GP_Attendance_${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}-${String(now.getMinutes()).padStart(2, '0')}.xlsx`;
            
            // Save file
            XLSX.writeFile(wb, filename);
            
            this.showNotification(`Attendance data exported to ${filename}`, 'success');
        } catch (error) {
            console.error('Export failed:', error);
            this.showNotification('Failed to export data. Please try again.', 'error');
        }
    }

    // Refresh data
    refreshData() {
        this.updateStats();
        this.populateAdminTable();
        this.showNotification('Data refreshed successfully', 'success');
    }

    // Clear all data
    clearAllData() {
        if (confirm('Are you sure you want to clear all attendance data? This action cannot be undone.')) {
            this.attendanceRecords = [];
            localStorage.removeItem('h2gp_attendance_records');
            this.updateStats();
            this.populateAdminTable();
            this.showNotification('All attendance data cleared', 'success');
        }
    }

    // Logout
    logout() {
        sessionStorage.removeItem('h2gp_user');
        window.location.href = 'login.html';
    }

    // Setup event listeners
    setupEventListeners() {
        // Form submission
        const form = document.getElementById('attendanceForm');
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const submitBtn = document.getElementById('submitBtn');
            const btnText = submitBtn.querySelector('.btn-text');
            const btnLoading = submitBtn.querySelector('.btn-loading');
            
            // Show loading state
            btnText.style.display = 'none';
            btnLoading.style.display = 'flex';
            submitBtn.disabled = true;
            
            try {
                const formData = new FormData(form);
                const success = await this.submitAttendance(formData);
                
                if (success) {
                    form.reset();
                }
            } catch (error) {
                console.error('Submission error:', error);
                this.showNotification('Failed to submit attendance. Please try again.', 'error');
            } finally {
                // Reset button state
                btnText.style.display = 'inline';
                btnLoading.style.display = 'none';
                submitBtn.disabled = false;
            }
        });

        // Form validation
        const studentIdInput = document.getElementById('studentId');
        const studentNameInput = document.getElementById('studentName');

        studentIdInput.addEventListener('input', (e) => {
            // Allow only alphanumeric characters
            e.target.value = e.target.value.replace(/[^a-zA-Z0-9]/g, '');
            this.validateField(e.target);
        });

        studentNameInput.addEventListener('input', (e) => {
            // Allow only letters and spaces
            e.target.value = e.target.value.replace(/[^a-zA-Z\s]/g, '');
            this.validateField(e.target);
        });

        // Make functions globally available
        window.clearForm = () => this.clearForm();
        window.recordNewEntry = () => this.recordNewEntry();
        window.viewAllData = () => this.viewAllData();
        window.hideAdminPanel = () => this.hideAdminPanel();
        window.exportToExcel = () => this.exportToExcel();
        window.refreshData = () => this.refreshData();
        window.clearAllData = () => this.clearAllData();
    }

    // Validate form field
    validateField(field) {
        const value = field.value.trim();
        
        if (field.required && !value) {
            field.classList.add('error');
            field.classList.remove('success');
        } else if (value) {
            field.classList.remove('error');
            field.classList.add('success');
        } else {
            field.classList.remove('error', 'success');
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
                <span class="notification-icon">
                    ${type === 'success' ? '✓' : type === 'error' ? '✗' : 'ℹ'}
                </span>
                <span class="notification-message">${message}</span>
            </div>
        `;

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

// Initialize student attendance system when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.studentAttendance = new StudentAttendanceSystem();
});

// Add additional CSS for student attendance specific styles
const additionalStyles = `
    .attendance-section {
        min-height: 100vh;
        background: linear-gradient(135deg, #0B1426 0%, #1A2B4C 25%, #2C4A7A 50%, #1E3A5F 75%, #0F1B2E 100%);
        background-size: 400% 400%;
        animation: gradientShift 15s ease infinite;
        padding: 6rem 0 2rem;
    }

    .attendance-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 3rem;
        padding: 2rem;
        background: rgba(17, 18, 21, 0.6);
        border: 1px solid rgba(42, 240, 255, 0.2);
        border-radius: 16px;
        backdrop-filter: blur(20px);
    }

    .header-content h1 {
        font-family: 'Space Grotesk', sans-serif;
        font-size: 2.5rem;
        color: #F5F5F5;
        margin: 0 0 0.5rem 0;
    }

    .header-content p {
        color: #B9BDC7;
        font-size: 1.1rem;
        margin: 0;
    }

    .header-stats {
        display: flex;
        gap: 2rem;
    }

    .stat-card {
        text-align: center;
        padding: 1.5rem;
        background: rgba(42, 240, 255, 0.1);
        border: 1px solid rgba(42, 240, 255, 0.3);
        border-radius: 12px;
        min-width: 100px;
    }

    .stat-number {
        display: block;
        font-family: 'Space Grotesk', sans-serif;
        font-size: 2rem;
        font-weight: 700;
        color: #2AF0FF;
        line-height: 1;
    }

    .stat-label {
        font-size: 0.9rem;
        color: #B9BDC7;
        text-transform: uppercase;
        letter-spacing: 0.05em;
    }

    .nav-user-info {
        display: flex;
        align-items: center;
        gap: 1rem;
        padding: 0.5rem 1rem;
        background: rgba(17, 18, 21, 0.8);
        border: 1px solid rgba(42, 240, 255, 0.2);
        border-radius: 8px;
    }

    .nav-profile-pic {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        border: 1px solid #2AF0FF;
    }

    .nav-user-details {
        display: flex;
        flex-direction: column;
    }

    .nav-user-name {
        color: #F5F5F5;
        font-size: 0.9rem;
        font-weight: 600;
    }

    .nav-user-email {
        color: #B9BDC7;
        font-size: 0.75rem;
    }

    .nav-logout-btn {
        background: rgba(255, 107, 107, 0.1);
        color: #ff6b6b;
        border: 1px solid rgba(255, 107, 107, 0.3);
        border-radius: 4px;
        padding: 0.25rem 0.75rem;
        font-size: 0.75rem;
        cursor: pointer;
        transition: all 0.3s ease;
    }

    .nav-logout-btn:hover {
        background: rgba(255, 107, 107, 0.2);
    }

    .form-card {
        background: rgba(17, 18, 21, 0.8);
        border: 1px solid rgba(42, 240, 255, 0.2);
        border-radius: 16px;
        padding: 2.5rem;
        backdrop-filter: blur(20px);
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
        max-width: 800px;
        margin: 0 auto;
    }

    .form-header {
        text-align: center;
        margin-bottom: 2rem;
    }

    .form-header h2 {
        font-family: 'Space Grotesk', sans-serif;
        color: #F5F5F5;
        font-size: 1.8rem;
        margin-bottom: 0.5rem;
    }

    .form-header p {
        color: #B9BDC7;
        font-size: 1rem;
    }

    .form-row {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1.5rem;
        margin-bottom: 1.5rem;
    }

    .form-group {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }

    .form-group label {
        color: #2AF0FF;
        font-weight: 600;
        font-size: 0.9rem;
        text-transform: uppercase;
        letter-spacing: 0.05em;
    }

    .form-group input,
    .form-group select,
    .form-group textarea {
        background: rgba(17, 18, 21, 0.8);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 8px;
        padding: 0.75rem;
        color: #F5F5F5;
        font-size: 1rem;
        transition: all 0.3s ease;
    }

    .form-group input:focus,
    .form-group select:focus,
    .form-group textarea:focus {
        outline: none;
        border-color: #2AF0FF;
        box-shadow: 0 0 0 3px rgba(42, 240, 255, 0.1);
    }

    .form-group input.error {
        border-color: #ff6b6b;
        box-shadow: 0 0 0 3px rgba(255, 107, 107, 0.1);
    }

    .form-group input.success {
        border-color: #6bcf7f;
        box-shadow: 0 0 0 3px rgba(107, 207, 127, 0.1);
    }

    .form-hint {
        font-size: 0.8rem;
        color: #B9BDC7;
        font-style: italic;
    }

    .form-actions {
        display: flex;
        gap: 1rem;
        justify-content: flex-end;
        margin-top: 2rem;
    }

    .clear-btn {
        background: transparent;
        color: #B9BDC7;
        border: 1px solid rgba(255, 255, 255, 0.2);
        border-radius: 8px;
        padding: 0.75rem 1.5rem;
        cursor: pointer;
        transition: all 0.3s ease;
    }

    .clear-btn:hover {
        background: rgba(255, 255, 255, 0.1);
        color: #F5F5F5;
    }

    .submit-btn {
        background: linear-gradient(135deg, #2AF0FF 0%, #0099CC 100%);
        color: #FFFFFF;
        border: none;
        border-radius: 8px;
        padding: 0.75rem 2rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }

    .submit-btn:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 10px 30px rgba(42, 240, 255, 0.3);
    }

    .submit-btn:disabled {
        opacity: 0.7;
        cursor: not-allowed;
    }

    .btn-loading {
        display: none;
        align-items: center;
        gap: 0.5rem;
    }

    .success-message {
        max-width: 600px;
        margin: 0 auto;
    }

    .success-card {
        background: rgba(17, 18, 21, 0.8);
        border: 1px solid rgba(107, 207, 127, 0.3);
        border-radius: 16px;
        padding: 3rem;
        text-align: center;
        backdrop-filter: blur(20px);
    }

    .success-icon {
        width: 80px;
        height: 80px;
        background: rgba(107, 207, 127, 0.2);
        border: 2px solid #6bcf7f;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 2rem;
        color: #6bcf7f;
        margin: 0 auto 1.5rem;
        animation: successPulse 2s ease-in-out infinite;
    }

    .success-card h3 {
        color: #F5F5F5;
        font-size: 1.8rem;
        margin-bottom: 1rem;
    }

    .success-card > p {
        color: #B9BDC7;
        font-size: 1.1rem;
        margin-bottom: 2rem;
    }

    .success-details {
        background: rgba(10, 10, 10, 0.5);
        border-radius: 8px;
        padding: 1.5rem;
        margin: 2rem 0;
        text-align: left;
    }

    .success-detail-item {
        display: flex;
        justify-content: space-between;
        padding: 0.5rem 0;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        color: #F5F5F5;
    }

    .success-detail-item:last-child {
        border-bottom: none;
    }

    .success-actions {
        display: flex;
        gap: 1rem;
        justify-content: center;
        margin-top: 2rem;
    }

    .new-entry-btn,
    .view-data-btn {
        padding: 0.75rem 1.5rem;
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.3s ease;
        font-weight: 600;
    }

    .new-entry-btn {
        background: linear-gradient(135deg, #2AF0FF 0%, #0099CC 100%);
        color: #FFFFFF;
        border: none;
    }

    .view-data-btn {
        background: transparent;
        color: #2AF0FF;
        border: 1px solid rgba(42, 240, 255, 0.3);
    }

    .new-entry-btn:hover,
    .view-data-btn:hover {
        transform: translateY(-2px);
    }

    .admin-panel {
        background: rgba(17, 18, 21, 0.8);
        border: 1px solid rgba(42, 240, 255, 0.2);
        border-radius: 16px;
        padding: 2rem;
        margin-top: 3rem;
        backdrop-filter: blur(20px);
    }

    .admin-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 2rem;
    }

    .admin-header h3 {
        color: #F5F5F5;
        font-size: 1.5rem;
        margin: 0;
    }

    .admin-actions {
        display: flex;
        gap: 0.5rem;
    }

    .admin-btn {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        background: rgba(42, 240, 255, 0.1);
        color: #2AF0FF;
        border: 1px solid rgba(42, 240, 255, 0.3);
        border-radius: 6px;
        padding: 0.5rem 1rem;
        font-size: 0.85rem;
        cursor: pointer;
        transition: all 0.3s ease;
    }

    .admin-btn:hover {
        background: rgba(42, 240, 255, 0.2);
    }

    .admin-btn.danger {
        background: rgba(255, 107, 107, 0.1);
        color: #ff6b6b;
        border-color: rgba(255, 107, 107, 0.3);
    }

    .admin-btn.danger:hover {
        background: rgba(255, 107, 107, 0.2);
    }

    .admin-stats {
        display: flex;
        gap: 2rem;
        margin-bottom: 2rem;
    }

    .admin-stat {
        text-align: center;
        padding: 1rem;
        background: rgba(42, 240, 255, 0.1);
        border: 1px solid rgba(42, 240, 255, 0.3);
        border-radius: 8px;
        flex: 1;
    }

    .admin-stat-number {
        display: block;
        font-family: 'Space Grotesk', sans-serif;
        font-size: 1.5rem;
        font-weight: 700;
        color: #2AF0FF;
        line-height: 1;
    }

    .admin-stat-label {
        font-size: 0.8rem;
        color: #B9BDC7;
        text-transform: uppercase;
        letter-spacing: 0.05em;
    }

    .admin-table-container {
        overflow-x: auto;
        border-radius: 8px;
        border: 1px solid rgba(255, 255, 255, 0.1);
    }

    .admin-table {
        width: 100%;
        border-collapse: collapse;
        background: rgba(10, 10, 10, 0.5);
    }

    .admin-table th,
    .admin-table td {
        padding: 1rem;
        text-align: left;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }

    .admin-table th {
        background: rgba(42, 240, 255, 0.1);
        color: #2AF0FF;
        font-weight: 600;
        text-transform: uppercase;
        font-size: 0.85rem;
        letter-spacing: 0.05em;
    }

    .admin-table td {
        color: #F5F5F5;
    }

    .admin-table tr:hover {
        background: rgba(42, 240, 255, 0.05);
    }

    .meeting-type-badge {
        display: inline-block;
        padding: 0.25rem 0.75rem;
        border-radius: 4px;
        font-size: 0.75rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.05em;
    }

    .meeting-type-badge.regular {
        background: rgba(42, 240, 255, 0.2);
        color: #2AF0FF;
    }

    .meeting-type-badge.workshop {
        background: rgba(255, 215, 0, 0.2);
        color: #FFD700;
    }

    .meeting-type-badge.competition {
        background: rgba(255, 107, 107, 0.2);
        color: #ff6b6b;
    }

    .meeting-type-badge.build-session {
        background: rgba(107, 207, 127, 0.2);
        color: #6bcf7f;
    }

    .meeting-type-badge.other {
        background: rgba(255, 255, 255, 0.2);
        color: #F5F5F5;
    }

    .no-records {
        text-align: center;
        color: #B9BDC7;
        font-style: italic;
        padding: 2rem;
    }

    /* Mobile responsive */
    @media (max-width: 768px) {
        .attendance-header {
            flex-direction: column;
            gap: 2rem;
            text-align: center;
        }
        
        .header-stats {
            justify-content: center;
        }
        
        .form-row {
            grid-template-columns: 1fr;
        }
        
        .form-actions {
            flex-direction: column;
        }
        
        .success-actions {
            flex-direction: column;
        }
        
        .admin-actions {
            flex-wrap: wrap;
            gap: 0.5rem;
        }
        
        .admin-stats {
            flex-direction: column;
            gap: 1rem;
        }
        
        .nav-user-info {
            flex-direction: column;
            gap: 0.5rem;
            text-align: center;
        }
    }
`;

// Inject additional styles
const styleSheet = document.createElement('style');
styleSheet.textContent = additionalStyles;
document.head.appendChild(styleSheet);
