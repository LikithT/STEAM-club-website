// Login System for Heritage H2GP Attendance
class LoginSystem {
    constructor() {
        this.isAuthenticated = false;
        this.currentUser = null;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.initCursorEffects();
        this.loadGoogleAPI();
    }

    // Load Google API
    loadGoogleAPI() {
        // Check if Google API is already loaded
        if (typeof gapi !== 'undefined') {
            gapi.load('auth2', () => {
                this.initGoogleAuth();
            });
        } else {
            // Fallback to demo mode if Google API fails to load
            console.log('Google API not available, using demo mode');
        }
    }

    // Initialize Google Authentication
    async initGoogleAuth() {
        try {
            await gapi.auth2.init({
                client_id: 'YOUR_GOOGLE_CLIENT_ID', // Replace with your actual client ID
                scope: 'profile email'
            });
            
            const authInstance = gapi.auth2.getAuthInstance();
            if (authInstance.isSignedIn.get()) {
                const user = authInstance.currentUser.get();
                this.handleAuthSuccess(user);
            }
        } catch (error) {
            console.error('Google Auth initialization failed:', error);
            this.showNotification('Google Auth unavailable, using demo mode', 'info');
        }
    }

    // Google Sign In
    async signInWithGoogle() {
        try {
            const authInstance = gapi.auth2.getAuthInstance();
            const user = await authInstance.signIn();
            this.handleAuthSuccess(user);
        } catch (error) {
            console.error('Google sign-in failed:', error);
            this.showNotification('Google sign-in failed, trying demo mode', 'error');
            // Fallback to demo sign in
            setTimeout(() => {
                this.demoSignIn();
            }, 2000);
        }
    }

    // Demo Sign In (for testing purposes)
    demoSignIn() {
        const demoUsers = [
            { 
                name: 'John Smith', 
                email: 'john.smith@student.edu', 
                id: 'demo_user_1',
                picture: 'https://via.placeholder.com/96/2AF0FF/FFFFFF?text=JS'
            },
            { 
                name: 'Sarah Johnson', 
                email: 'sarah.johnson@student.edu', 
                id: 'demo_user_2',
                picture: 'https://via.placeholder.com/96/FFD700/000000?text=SJ'
            },
            { 
                name: 'Mike Chen', 
                email: 'mike.chen@student.edu', 
                id: 'demo_user_3',
                picture: 'https://via.placeholder.com/96/FF6B6B/FFFFFF?text=MC'
            },
            { 
                name: 'Emily Davis', 
                email: 'emily.davis@student.edu', 
                id: 'demo_user_4',
                picture: 'https://via.placeholder.com/96/6BCF7F/FFFFFF?text=ED'
            }
        ];
        
        const randomUser = demoUsers[Math.floor(Math.random() * demoUsers.length)];
        
        // Simulate authentication process
        this.showNotification('Authenticating...', 'info');
        
        setTimeout(() => {
            this.handleAuthSuccess({
                getBasicProfile: () => ({
                    getName: () => randomUser.name,
                    getEmail: () => randomUser.email,
                    getId: () => randomUser.id,
                    getImageUrl: () => randomUser.picture
                })
            });
        }, 1500);
    }

    // Handle successful authentication
    handleAuthSuccess(user) {
        const profile = user.getBasicProfile();
        this.isAuthenticated = true;
        this.currentUser = {
            name: profile.getName(),
            email: profile.getEmail(),
            id: profile.getId(),
            picture: profile.getImageUrl ? profile.getImageUrl() : 'https://via.placeholder.com/96/2AF0FF/FFFFFF?text=' + profile.getName().charAt(0)
        };

        // Store user data in session storage
        sessionStorage.setItem('h2gp_user', JSON.stringify(this.currentUser));
        
        this.showLoginSuccess();
        this.showNotification(`Welcome, ${this.currentUser.name}!`, 'success');
    }

    // Show login success screen
    showLoginSuccess() {
        const loginForm = document.getElementById('loginForm');
        const loginSuccess = document.getElementById('loginSuccess');
        const welcomeMessage = document.getElementById('welcomeMessage');

        loginForm.style.display = 'none';
        loginSuccess.style.display = 'block';
        
        welcomeMessage.innerHTML = `
            <div class="user-welcome">
                <img src="${this.currentUser.picture}" alt="Profile" class="profile-picture">
                <div class="user-details">
                    <strong>${this.currentUser.name}</strong>
                    <span>${this.currentUser.email}</span>
                </div>
            </div>
        `;
    }

    // Proceed to attendance page
    proceedToAttendance() {
        // Add a smooth transition effect
        document.body.style.opacity = '0.5';
        
        setTimeout(() => {
            window.location.href = 'student-attendance.html';
        }, 500);
    }

    // Setup event listeners
    setupEventListeners() {
        // Make functions globally available
        window.signInWithGoogle = () => this.signInWithGoogle();
        window.demoSignIn = () => this.demoSignIn();
        window.proceedToAttendance = () => this.proceedToAttendance();

        // Add loading states to buttons
        const googleBtn = document.getElementById('googleSignInBtn');
        if (googleBtn) {
            googleBtn.addEventListener('click', () => {
                googleBtn.classList.add('loading');
                googleBtn.innerHTML = '<span class="loading-spinner"></span>Signing in...';
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
        document.querySelectorAll('button, a, input').forEach(element => {
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

        // Hide notification after 4 seconds
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 4000);
    }
}

// Initialize login system when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.loginSystem = new LoginSystem();
});

// Add some additional CSS for login-specific styles
const additionalStyles = `
    .login-section {
        min-height: 100vh;
        background: linear-gradient(135deg, #0B1426 0%, #1A2B4C 25%, #2C4A7A 50%, #1E3A5F 75%, #0F1B2E 100%);
        background-size: 400% 400%;
        animation: gradientShift 15s ease infinite;
        padding: 2rem 0;
        display: flex;
        align-items: center;
    }

    .login-container {
        max-width: 1200px;
        margin: 0 auto;
        padding: 2rem;
    }

    .login-header {
        text-align: center;
        margin-bottom: 3rem;
    }

    .login-logo {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 1rem;
    }

    .logo-icon {
        font-size: 4rem;
        filter: drop-shadow(0 0 20px rgba(42, 240, 255, 0.5));
    }

    .login-logo h1 {
        font-family: 'Space Grotesk', sans-serif;
        font-size: 3rem;
        font-weight: 700;
        color: #F5F5F5;
        margin: 0;
        text-shadow: 0 0 30px rgba(42, 240, 255, 0.3);
    }

    .login-logo p {
        font-family: 'Inter', sans-serif;
        color: #B9BDC7;
        font-size: 1.2rem;
        margin: 0;
    }

    .login-content {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 3rem;
        align-items: start;
    }

    .login-card {
        background: rgba(17, 18, 21, 0.8);
        border: 1px solid rgba(42, 240, 255, 0.2);
        border-radius: 16px;
        padding: 2.5rem;
        backdrop-filter: blur(20px);
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
    }

    .card-header {
        text-align: center;
        margin-bottom: 2rem;
    }

    .card-header h2 {
        font-family: 'Space Grotesk', sans-serif;
        color: #F5F5F5;
        font-size: 1.8rem;
        margin-bottom: 0.5rem;
    }

    .card-header p {
        color: #B9BDC7;
        font-size: 1rem;
        line-height: 1.5;
    }

    .google-signin-container {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
    }

    .google-signin-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 1rem;
        background: #FFFFFF;
        color: #333333;
        border: none;
        border-radius: 8px;
        padding: 1rem 2rem;
        font-family: 'Inter', sans-serif;
        font-size: 1rem;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }

    .google-signin-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
    }

    .google-signin-btn.loading {
        opacity: 0.7;
        cursor: not-allowed;
    }

    .demo-signin {
        text-align: center;
        padding-top: 1rem;
        border-top: 1px solid rgba(42, 240, 255, 0.2);
    }

    .demo-text {
        color: #B9BDC7;
        font-size: 0.9rem;
        margin-bottom: 1rem;
    }

    .demo-signin-btn {
        background: rgba(42, 240, 255, 0.1);
        color: #2AF0FF;
        border: 1px solid rgba(42, 240, 255, 0.3);
        border-radius: 8px;
        padding: 0.75rem 1.5rem;
        font-family: 'Inter', sans-serif;
        font-size: 0.9rem;
        cursor: pointer;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .demo-signin-btn:hover {
        background: rgba(42, 240, 255, 0.2);
        transform: translateY(-1px);
    }

    .login-success {
        text-align: center;
    }

    .success-icon {
        width: 80px;
        height: 80px;
        background: rgba(42, 240, 255, 0.2);
        border: 2px solid #2AF0FF;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 2rem;
        color: #2AF0FF;
        margin: 0 auto 1.5rem;
        animation: successPulse 2s ease-in-out infinite;
    }

    @keyframes successPulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.05); }
    }

    .login-success h3 {
        color: #F5F5F5;
        font-size: 1.5rem;
        margin-bottom: 1rem;
    }

    .user-welcome {
        display: flex;
        align-items: center;
        gap: 1rem;
        justify-content: center;
        margin: 1.5rem 0;
    }

    .profile-picture {
        width: 48px;
        height: 48px;
        border-radius: 50%;
        border: 2px solid #2AF0FF;
    }

    .user-details {
        display: flex;
        flex-direction: column;
        text-align: left;
    }

    .user-details strong {
        color: #F5F5F5;
        font-size: 1.1rem;
    }

    .user-details span {
        color: #B9BDC7;
        font-size: 0.9rem;
    }

    .proceed-btn {
        background: linear-gradient(135deg, #2AF0FF 0%, #0099CC 100%);
        color: #FFFFFF;
        border: none;
        border-radius: 8px;
        padding: 1rem 2rem;
        font-family: 'Inter', sans-serif;
        font-size: 1rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        margin-top: 1rem;
    }

    .proceed-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 10px 30px rgba(42, 240, 255, 0.3);
    }

    .login-info {
        display: flex;
        flex-direction: column;
        gap: 2rem;
    }

    .info-card {
        background: rgba(17, 18, 21, 0.6);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 12px;
        padding: 2rem;
    }

    .info-card h3 {
        color: #2AF0FF;
        font-size: 1.3rem;
        margin-bottom: 1rem;
        font-family: 'Space Grotesk', sans-serif;
    }

    .info-card ul,
    .info-card ol {
        color: #F5F5F5;
        line-height: 1.8;
        padding-left: 1.5rem;
    }

    .info-card li {
        margin-bottom: 0.5rem;
    }

    .loading-spinner {
        width: 16px;
        height: 16px;
        border: 2px solid #f3f3f3;
        border-top: 2px solid #333;
        border-radius: 50%;
        animation: spin 1s linear infinite;
        display: inline-block;
        margin-right: 0.5rem;
    }

    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }

    /* Mobile responsive */
    @media (max-width: 768px) {
        .login-content {
            grid-template-columns: 1fr;
            gap: 2rem;
        }
        
        .login-card {
            padding: 2rem;
        }
        
        .login-logo h1 {
            font-size: 2.5rem;
        }
    }
`;

// Inject additional styles
const styleSheet = document.createElement('style');
styleSheet.textContent = additionalStyles;
document.head.appendChild(styleSheet);
