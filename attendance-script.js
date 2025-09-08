// Attendance System JavaScript

// Global variables
let currentUser = null;
let attendanceRecords = JSON.parse(localStorage.getItem('h2gp-attendance-records')) || [];
let isSignedIn = false;

// Admin emails (you can modify this list)
const adminEmails = [
    'penningtons@luhsd.net',
    'admin@heritage-h2gp.com',
    // Add more admin emails as needed
];

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeAttendanceSystem();
    initializeCursor();
    initializeMobileNavigation();
    setCurrentDate();
    loadAttendanceRecords();
});

// Initialize the attendance system
function initializeAttendanceSystem() {
    console.log('Initializing Heritage H2GP Attendance System');
    
    // Check if user was previously signed in
    const savedUser = localStorage.getItem('h2gp-current-user');
    if (savedUser) {
        try {
            currentUser = JSON.parse(savedUser);
            showAttendanceForm();
        } catch (error) {
            console.error('Error loading saved user:', error);
            localStorage.removeItem('h2gp-current-user');
        }
    }
    
    // Set up event listeners
    setupEventListeners();
}

// Set up all event listeners
function setupEventListeners() {
    // Manual Google Sign-In button
    const manualSignInBtn = document.getElementById('manualSignInBtn');
    if (manualSignInBtn) {
        manualSignInBtn.addEventListener('click', handleManualSignIn);
    }
    
    // Sign out button
    const signOutBtn = document.getElementById('signOutBtn');
    if (signOutBtn) {
        signOutBtn.addEventListener('click', handleSignOut);
    }
    
    // Attendance form
    const attendanceForm = document.getElementById('attendanceForm');
    if (attendanceForm) {
        attendanceForm.addEventListener('submit', handleAttendanceSubmit);
    }
    
    // Back button
    const backBtn = document.getElementById('backBtn');
    if (backBtn) {
        backBtn.addEventListener('click', showAttendanceForm);
    }
    
    // Admin controls
    const downloadExcelBtn = document.getElementById('downloadExcelBtn');
    if (downloadExcelBtn) {
        downloadExcelBtn.addEventListener('click', downloadExcelReport);
    }
    
    const viewRecordsBtn = document.getElementById('viewRecordsBtn');
    if (viewRecordsBtn) {
        viewRecordsBtn.addEventListener('click', toggleRecordsView);
    }
    
    const clearDataBtn = document.getElementById('clearDataBtn');
    if (clearDataBtn) {
        clearDataBtn.addEventListener('click', clearAllData);
    }
}

// Handle manual Google Sign-In (simulated for demo)
function handleManualSignIn() {
    // In a real implementation, this would use Google OAuth
    // For demo purposes, we'll simulate a sign-in
    showNotification('Simulating Google Sign-In...', 'info');
    
    setTimeout(() => {
        // Simulate successful sign-in
        const mockUser = {
            name: 'Demo Student',
            email: 'demo.student@student.luhsd.net',
            picture: 'https://via.placeholder.com/60x60/2af0ff/ffffff?text=DS',
            id: 'demo_' + Date.now()
        };
        
        handleSuccessfulSignIn(mockUser);
    }, 1500);
}

// Handle successful Google Sign-In
function handleSuccessfulSignIn(userData) {
    currentUser = userData;
    isSignedIn = true;
    
    // Save user data
    localStorage.setItem('h2gp-current-user', JSON.stringify(currentUser));
    
    // Show attendance form
    showAttendanceForm();
    
    showNotification('Successfully signed in!', 'success');
    console.log('User signed in:', currentUser);
}

// Google OAuth callback (for real implementation)
function handleCredentialResponse(response) {
    // This would be called by Google OAuth
    // For now, we'll use the manual sign-in
    console.log('Google OAuth response:', response);
}

// Show attendance form
function showAttendanceForm() {
    if (!currentUser) return;
    
    // Hide auth card, show attendance card
    document.getElementById('authCard').style.display = 'none';
    document.getElementById('attendanceCard').style.display = 'block';
    document.getElementById('successCard').style.display = 'none';
    
    // Populate user info
    document.getElementById('userName').textContent = currentUser.name;
    document.getElementById('userEmail').textContent = currentUser.email;
    document.getElementById('userAvatar').src = currentUser.picture;
    
    // Check if user is admin
    if (isAdmin(currentUser.email)) {
        document.getElementById('adminCard').style.display = 'block';
        updateAdminStats();
    }
    
    // Add animations
    document.getElementById('attendanceCard').classList.add('fade-in');
}

// Handle attendance form submission
function handleAttendanceSubmit(event) {
    event.preventDefault();
    
    if (!currentUser) {
        showNotification('Please sign in first', 'error');
        return;
    }
    
    // Get form data
    const formData = new FormData(event.target);
    const studentId = formData.get('studentId').trim();
    const studentName = formData.get('studentName').trim();
    const meetingType = formData.get('meetingType');
    const meetingDate = formData.get('meetingDate');
    const notes = formData.get('notes').trim();
    
    // Validate required fields
    if (!studentId || !studentName || !meetingType) {
        showNotification('Please fill in all required fields', 'error');
        return;
    }
    
    // Check for duplicate attendance today
    const today = new Date().toDateString();
    const existingRecord = attendanceRecords.find(record => 
        record.email === currentUser.email && 
        new Date(record.timestamp).toDateString() === today
    );
    
    if (existingRecord) {
        showNotification('You have already marked attendance today', 'warning');
        return;
    }
    
    // Create attendance record
    const attendanceRecord = {
        id: generateId(),
        timestamp: new Date().toISOString(),
        date: new Date().toLocaleDateString(),
        time: new Date().toLocaleTimeString(),
        studentId: studentId,
        studentName: studentName,
        email: currentUser.email,
        googleName: currentUser.name,
        meetingType: meetingType,
        meetingDate: meetingDate,
        notes: notes || '',
        userPicture: currentUser.picture
    };
    
    // Add to records
    attendanceRecords.push(attendanceRecord);
    
    // Save to localStorage
    localStorage.setItem('h2gp-attendance-records', JSON.stringify(attendanceRecords));
    
    // Show success message
    showSuccessMessage(attendanceRecord);
    
    // Update admin stats if admin
    if (isAdmin(currentUser.email)) {
        updateAdminStats();
    }
    
    console.log('Attendance recorded:', attendanceRecord);
}

// Show success message
function showSuccessMessage(record) {
    // Hide attendance form, show success card
    document.getElementById('attendanceCard').style.display = 'none';
    document.getElementById('successCard').style.display = 'block';
    
    // Populate success details
    const detailsHtml = `
        <p><strong>Date:</strong> ${record.date}</p>
        <p><strong>Time:</strong> ${record.time}</p>
        <p><strong>Student ID:</strong> ${record.studentId}</p>
        <p><strong>Name:</strong> ${record.studentName}</p>
        <p><strong>Meeting Type:</strong> ${record.meetingType}</p>
        ${record.notes ? `<p><strong>Notes:</strong> ${record.notes}</p>` : ''}
    `;
    
    document.getElementById('attendanceDetails').innerHTML = detailsHtml;
    
    // Add animation
    document.getElementById('successCard').classList.add('slide-up');
    
    showNotification('Attendance recorded successfully!', 'success');
}

// Handle sign out
function handleSignOut() {
    currentUser = null;
    isSignedIn = false;
    
    // Clear saved user data
    localStorage.removeItem('h2gp-current-user');
    
    // Reset UI
    document.getElementById('authCard').style.display = 'block';
    document.getElementById('attendanceCard').style.display = 'none';
    document.getElementById('successCard').style.display = 'none';
    document.getElementById('adminCard').style.display = 'none';
    
    // Reset form
    document.getElementById('attendanceForm').reset();
    setCurrentDate();
    
    showNotification('Signed out successfully', 'info');
    console.log('User signed out');
}

// Check if user is admin
function isAdmin(email) {
    return adminEmails.includes(email.toLowerCase());
}

// Download Excel report
function downloadExcelReport() {
    if (attendanceRecords.length === 0) {
        showNotification('No attendance records to export', 'warning');
        return;
    }
    
    try {
        // Prepare data for Excel
        const excelData = attendanceRecords.map(record => ({
            'Date': record.date,
            'Time': record.time,
            'Student ID': record.studentId,
            'Student Name': record.studentName,
            'Email': record.email,
            'Google Name': record.googleName,
            'Meeting Type': record.meetingType,
            'Meeting Date': record.meetingDate || record.date,
            'Notes': record.notes,
            'Timestamp': record.timestamp
        }));
        
        // Create workbook
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(excelData);
        
        // Auto-size columns
        const colWidths = [
            { wch: 12 }, // Date
            { wch: 10 }, // Time
            { wch: 12 }, // Student ID
            { wch: 20 }, // Student Name
            { wch: 25 }, // Email
            { wch: 20 }, // Google Name
            { wch: 15 }, // Meeting Type
            { wch: 12 }, // Meeting Date
            { wch: 30 }, // Notes
            { wch: 20 }  // Timestamp
        ];
        ws['!cols'] = colWidths;
        
        // Add worksheet to workbook
        XLSX.utils.book_append_sheet(wb, ws, 'Attendance Records');
        
        // Generate filename with current date
        const filename = `Heritage_H2GP_Attendance_${new Date().toISOString().split('T')[0]}.xlsx`;
        
        // Download file
        XLSX.writeFile(wb, filename);
        
        showNotification('Excel report downloaded successfully!', 'success');
        console.log('Excel report downloaded:', filename);
        
    } catch (error) {
        console.error('Error generating Excel report:', error);
        showNotification('Error generating Excel report', 'error');
    }
}

// Toggle records view
function toggleRecordsView() {
    const recordsSection = document.getElementById('recordsSection');
    const isVisible = recordsSection.style.display === 'block';
    
    if (isVisible) {
        recordsSection.style.display = 'none';
        document.getElementById('viewRecordsBtn').innerHTML = '<span class="btn-icon">👥</span>View All Records';
    } else {
        recordsSection.style.display = 'block';
        document.getElementById('viewRecordsBtn').innerHTML = '<span class="btn-icon">🙈</span>Hide Records';
        loadRecordsTable();
    }
}

// Load records into table
function loadRecordsTable() {
    const tbody = document.getElementById('recordsTableBody');
    
    if (attendanceRecords.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; color: #888;">No attendance records found</td></tr>';
        return;
    }
    
    // Sort records by timestamp (newest first)
    const sortedRecords = [...attendanceRecords].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    tbody.innerHTML = sortedRecords.map(record => `
        <tr>
            <td>${record.date}</td>
            <td>${record.time}</td>
            <td>${record.studentId}</td>
            <td>${record.studentName}</td>
            <td>${record.email}</td>
            <td>${record.meetingType}</td>
            <td>${record.notes || '-'}</td>
        </tr>
    `).join('');
}

// Update admin statistics
function updateAdminStats() {
    const totalRecords = attendanceRecords.length;
    const uniqueStudents = new Set(attendanceRecords.map(r => r.email)).size;
    
    // Calculate this week's records
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const thisWeekRecords = attendanceRecords.filter(record => 
        new Date(record.timestamp) >= oneWeekAgo
    ).length;
    
    // Update UI
    document.getElementById('totalRecords').textContent = totalRecords;
    document.getElementById('uniqueStudents').textContent = uniqueStudents;
    document.getElementById('thisWeekRecords').textContent = thisWeekRecords;
}

// Clear all data
function clearAllData() {
    if (confirm('Are you sure you want to clear all attendance data? This action cannot be undone.')) {
        attendanceRecords = [];
        localStorage.removeItem('h2gp-attendance-records');
        
        // Update UI
        updateAdminStats();
        loadRecordsTable();
        
        showNotification('All attendance data cleared', 'info');
        console.log('All attendance data cleared');
    }
}

// Load attendance records on page load
function loadAttendanceRecords() {
    console.log(`Loaded ${attendanceRecords.length} attendance records`);
}

// Set current date in form
function setCurrentDate() {
    const dateInput = document.getElementById('meetingDate');
    if (dateInput) {
        const today = new Date().toISOString().split('T')[0];
        dateInput.value = today;
    }
}

// Generate unique ID
function generateId() {
    return 'att_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// Show notification
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(n => n.remove());
    
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    // Style the notification
    Object.assign(notification.style, {
        position: 'fixed',
        top: '20px',
        right: '20px',
        padding: '15px 20px',
        borderRadius: '10px',
        color: '#ffffff',
        fontWeight: '500',
        zIndex: '10000',
        maxWidth: '300px',
        boxShadow: '0 4px 15px rgba(0, 0, 0, 0.3)',
        transform: 'translateX(400px)',
        transition: 'transform 0.3s ease'
    });
    
    // Set background color based on type
    switch (type) {
        case 'success':
            notification.style.background = 'linear-gradient(135deg, #00ff88 0%, #00cc6a 100%)';
            break;
        case 'error':
            notification.style.background = 'linear-gradient(135deg, #ff4757 0%, #ff3742 100%)';
            break;
        case 'warning':
            notification.style.background = 'linear-gradient(135deg, #ffa502 0%, #ff8c00 100%)';
            break;
        default:
            notification.style.background = 'linear-gradient(135deg, #2af0ff 0%, #0099cc 100%)';
    }
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Auto remove after 4 seconds
    setTimeout(() => {
        notification.style.transform = 'translateX(400px)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 300);
    }, 4000);
}

// Initialize cursor (reuse from main site)
function initializeCursor() {
    const cursor = document.querySelector('.cursor');
    const links = document.querySelectorAll('a, button, .attendance-card, .admin-btn');
    
    if (window.innerWidth > 768 && cursor) {
        document.addEventListener('mousemove', (e) => {
            cursor.style.left = e.clientX + 'px';
            cursor.style.top = e.clientY + 'px';
        });
        
        links.forEach(link => {
            link.addEventListener('mouseenter', () => {
                cursor.classList.add('hover');
            });
            
            link.addEventListener('mouseleave', () => {
                cursor.classList.remove('hover');
            });
        });
    }
}

// Initialize mobile navigation (reuse from main site)
function initializeMobileNavigation() {
    const mobileToggle = document.getElementById('mobileNavToggle');
    const mobileMenu = document.getElementById('mobileNavMenu');
    const mobileLinks = document.querySelectorAll('.mobile-nav-link');
    let isMenuOpen = false;

    if (!mobileToggle || !mobileMenu) return;

    // Toggle mobile menu
    mobileToggle.addEventListener('click', () => {
        isMenuOpen = !isMenuOpen;
        
        // Toggle hamburger animation
        mobileToggle.classList.toggle('active', isMenuOpen);
        
        // Toggle mobile menu
        mobileMenu.classList.toggle('active', isMenuOpen);
        
        // Prevent body scroll when menu is open
        document.body.style.overflow = isMenuOpen ? 'hidden' : 'auto';
    });

    // Handle mobile nav link clicks
    mobileLinks.forEach(link => {
        link.addEventListener('click', () => {
            // Close mobile menu
            isMenuOpen = false;
            mobileToggle.classList.remove('active');
            mobileMenu.classList.remove('active');
            document.body.style.overflow = 'auto';
        });
    });

    // Close mobile menu when clicking outside
    document.addEventListener('click', (e) => {
        if (isMenuOpen && !mobileMenu.contains(e.target) && !mobileToggle.contains(e.target)) {
            isMenuOpen = false;
            mobileToggle.classList.remove('active');
            mobileMenu.classList.remove('active');
            document.body.style.overflow = 'auto';
        }
    });
}

// Export functions for potential external use
window.HeritageAttendance = {
    downloadExcelReport,
    clearAllData,
    getCurrentUser: () => currentUser,
    getAttendanceRecords: () => attendanceRecords,
    isUserAdmin: () => currentUser && isAdmin(currentUser.email)
};

console.log('Heritage H2GP Attendance System loaded successfully');
