// Login Script with Google Authentication and Demo Support

// Google OAuth Configuration
const GOOGLE_CLIENT_ID = '1234567890-abcdefghijklmnopqrstuvwxyz123456.apps.googleusercontent.com'; // Replace with actual client ID

// Demo users for testing
const DEMO_USERS = [
    {
        id: 'demo1',
        name: 'Emily Davis',
        email: 'emily.davis@student.edu',
        picture: 'https://via.placeholder.com/96/007aff/ffffff?text=ED'
    },
    {
        id: 'demo2',
        name: 'Alex Johnson',
        email: 'alex.johnson@student.edu',
        picture: 'https://via.placeholder.com/96/34c759/ffffff?text=AJ'
    }
];

// Initialize Google Sign-In
function initializeGoogleSignIn() {
    try {
        // Check if Google Identity Services is loaded
        if (typeof google !== 'undefined' && google.accounts) {
            google.accounts.id.initialize({
                client_id: GOOGLE_CLIENT_ID,
                callback: handleCredentialResponse,
                auto_select: false,
                cancel_on_tap_outside: true
            });

            // Render the sign-in button
            const signInDiv = document.getElementById('g_id_signin');
            if (signInDiv) {
                google.accounts.id.renderButton(signInDiv, {
                    type: 'standard',
                    shape: 'rectangular',
                    theme: 'outline',
                    text: 'signin_with',
                    size: 'large',
                    logo_alignment: 'left',
                    width: '100%'
                });
            }

            console.log('Google Sign-In initialized successfully');
        } else {
            console.warn('Google Identity Services not loaded, using demo mode only');
            // Hide Google sign-in container if not available
            const googleContainer = document.querySelector('.google-signin-container');
            const divider = document.querySelector('.divider');
            if (googleContainer) googleContainer.style.display = 'none';
            if (divider) divider.style.display = 'none';
        }
    } catch (error) {
        console.error('Google Sign-In initialization failed:', error);
        // Hide Google sign-in elements on error
        const googleContainer = document.querySelector('.google-signin-container');
        const divider = document.querySelector('.divider');
        if (googleContainer) googleContainer.style.display = 'none';
        if (divider) divider.style.display = 'none';
    }
}

// Handle Google credential response
function handleCredentialResponse(response) {
    try {
        // Decode the JWT token
        const responsePayload = decodeJwtResponse(response.credential);
        
        const userData = {
            id: responsePayload.sub,
            name: responsePayload.name,
            email: responsePayload.email,
            picture: responsePayload.picture,
            loginMethod: 'google'
        };

        // Store user data and proceed
        storeUserData(userData);
        showLoginSuccess(userData);
        
    } catch (error) {
        console.error('Error handling Google credential:', error);
        showError('Google sign-in failed. Please try the demo account.');
    }
}

// Decode JWT token
function decodeJwtResponse(token) {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        return JSON.parse(jsonPayload);
    } catch (error) {
        console.error('Error decoding JWT:', error);
        throw error;
    }
}

// Demo sign-in function
function demoSignIn() {
    try {
        // Select a random demo user
        const randomUser = DEMO_USERS[Math.floor(Math.random() * DEMO_USERS.length)];
        
        const userData = {
            ...randomUser,
            loginMethod: 'demo'
        };

        // Store user data and proceed
        storeUserData(userData);
        showLoginSuccess(userData);
        
    } catch (error) {
        console.error('Demo sign-in failed:', error);
        showError('Demo sign-in failed. Please try again.');
    }
}

// Store user data in session storage
function storeUserData(userData) {
    try {
        sessionStorage.setItem('h2gp_user', JSON.stringify(userData));
        sessionStorage.setItem('h2gp_login_time', new Date().toISOString());
        console.log('User data stored successfully');
    } catch (error) {
        console.error('Error storing user data:', error);
    }
}

// Show login success state
function showLoginSuccess(userData) {
    try {
        const loginForm = document.getElementById('loginForm');
        const loginSuccess = document.getElementById('loginSuccess');
        const welcomeMessage = document.getElementById('welcomeMessage');

        if (loginForm && loginSuccess && welcomeMessage) {
            // Hide login form
            loginForm.style.display = 'none';
            
            // Update welcome message
            welcomeMessage.textContent = `Welcome, ${userData.name}! You are now signed in.`;
            
            // Show success state
            loginSuccess.style.display = 'block';
            
            // Add smooth transition
            loginSuccess.style.opacity = '0';
            setTimeout(() => {
                loginSuccess.style.transition = 'opacity 0.3s ease';
                loginSuccess.style.opacity = '1';
            }, 100);
        }
    } catch (error) {
        console.error('Error showing login success:', error);
    }
}

// Show error message
function showError(message) {
    try {
        // Create or update error message
        let errorDiv = document.querySelector('.error-message');
        if (!errorDiv) {
            errorDiv = document.createElement('div');
            errorDiv.className = 'error-message';
            errorDiv.style.cssText = `
                background: #ff3b30;
                color: white;
                padding: 1rem;
                border-radius: 12px;
                margin: 1rem 0;
                text-align: center;
                font-size: 0.9rem;
                animation: slideIn 0.3s ease;
            `;
            
            const loginForm = document.getElementById('loginForm');
            if (loginForm) {
                loginForm.appendChild(errorDiv);
            }
        }
        
        errorDiv.textContent = message;
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
            if (errorDiv && errorDiv.parentNode) {
                errorDiv.style.animation = 'slideOut 0.3s ease';
                setTimeout(() => {
                    if (errorDiv && errorDiv.parentNode) {
                        errorDiv.parentNode.removeChild(errorDiv);
                    }
                }, 300);
            }
        }, 5000);
        
    } catch (error) {
        console.error('Error showing error message:', error);
    }
}

// Proceed to attendance page
function proceedToAttendance() {
    try {
        // Verify user is still logged in
        const userData = sessionStorage.getItem('h2gp_user');
        if (!userData) {
            showError('Session expired. Please sign in again.');
            location.reload();
            return;
        }

        // Add loading state
        const proceedBtn = document.querySelector('.proceed-btn');
        if (proceedBtn) {
            proceedBtn.textContent = 'Loading...';
            proceedBtn.disabled = true;
            proceedBtn.style.opacity = '0.6';
        }

        // Navigate to attendance page
        setTimeout(() => {
            window.location.href = 'student-attendance.html';
        }, 500);
        
    } catch (error) {
        console.error('Error proceeding to attendance:', error);
        showError('Navigation failed. Please try again.');
    }
}

// Check if user is already logged in
function checkExistingLogin() {
    try {
        const userData = sessionStorage.getItem('h2gp_user');
        const loginTime = sessionStorage.getItem('h2gp_login_time');
        
        if (userData && loginTime) {
            const user = JSON.parse(userData);
            const loginDate = new Date(loginTime);
            const now = new Date();
            const hoursSinceLogin = (now - loginDate) / (1000 * 60 * 60);
            
            // Auto-logout after 24 hours
            if (hoursSinceLogin < 24) {
                showLoginSuccess(user);
                return true;
            } else {
                // Clear expired session
                sessionStorage.removeItem('h2gp_user');
                sessionStorage.removeItem('h2gp_login_time');
            }
        }
        return false;
    } catch (error) {
        console.error('Error checking existing login:', error);
        return false;
    }
}

// Add CSS animations
function addAnimations() {
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from {
                opacity: 0;
                transform: translateY(-10px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        @keyframes slideOut {
            from {
                opacity: 1;
                transform: translateY(0);
            }
            to {
                opacity: 0;
                transform: translateY(-10px);
            }
        }
        
        .login-card {
            animation: slideIn 0.5s ease;
        }
        
        .info-section {
            animation: slideIn 0.5s ease 0.2s both;
        }
    `;
    document.head.appendChild(style);
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('Login page loaded');
    
    // Add animations
    addAnimations();
    
    // Check for existing login
    if (!checkExistingLogin()) {
        // Initialize Google Sign-In after a short delay
        setTimeout(initializeGoogleSignIn, 1000);
    }
});

// Initialize when Google API is loaded
window.onload = function() {
    // Backup initialization in case DOMContentLoaded already fired
    if (!checkExistingLogin()) {
        setTimeout(initializeGoogleSignIn, 1500);
    }
};

// Handle page visibility changes
document.addEventListener('visibilitychange', function() {
    if (!document.hidden) {
        // Re-check login status when page becomes visible
        checkExistingLogin();
    }
});

// Export functions for global access
window.handleCredentialResponse = handleCredentialResponse;
window.demoSignIn = demoSignIn;
window.proceedToAttendance = proceedToAttendance;
