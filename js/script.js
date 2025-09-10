// GSAP ScrollTrigger registration
gsap.registerPlugin(ScrollTrigger);

// Global variables
let photos = JSON.parse(localStorage.getItem('h2gp-photos')) || [];
let currentImageIndex = 0;
let viewer = null;

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initCursor();
    initVideoBackground();
    initScrollAnimations();
    initNavigation();
    initMobileNavigation();
    initPhotoGallery();
    addDefaultPhotos();
    loadPhotos();
    initModelViewer();
    initMusicPlayer();
    
    // Load 3D model automatically when page loads
    setTimeout(() => {
        loadModel();
        // Always load the Heritage H2GP model
        loadHeritageH2GPModel();
    }, 1000);
    
    // Add smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
});

// Custom Cursor
function initCursor() {
    const cursor = document.querySelector('.cursor');
    const links = document.querySelectorAll('a, button, .project-card, .gallery-item');
    
    if (window.innerWidth > 768) {
        document.addEventListener('mousemove', (e) => {
            gsap.to(cursor, {
                x: e.clientX,
                y: e.clientY,
                duration: 0.1,
                ease: "power2.out"
            });
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

// YouTube Video Background
function initVideoBackground() {
    const iframe = document.getElementById('hero-video');
    if (!iframe) return;
    
    // Handle iframe loading
    iframe.addEventListener('load', () => {
        console.log('YouTube video iframe loaded successfully');
    });
    
    // Handle iframe errors
    iframe.addEventListener('error', (e) => {
        console.log('YouTube video loading error:', e);
        const fallback = document.querySelector('.video-fallback');
        if (fallback) {
            fallback.style.display = 'flex';
        }
    });
    
    // Set up intersection observer to pause/resume video when not visible
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                console.log('Hero video is visible');
            } else {
                console.log('Hero video is not visible');
            }
        });
    });
    
    observer.observe(iframe);
}

// Scroll Animations
function initScrollAnimations() {
    // Navigation scroll effect
    ScrollTrigger.create({
        start: "top -80",
        end: 99999,
        toggleClass: {className: "scrolled", targets: ".nav"}
    });
    
    // Section titles animation
    gsap.utils.toArray('.section-title').forEach(title => {
        gsap.fromTo(title, 
            {
                opacity: 0,
                y: 50
            },
            {
                opacity: 1,
                y: 0,
                duration: 1,
                ease: "power2.out",
                scrollTrigger: {
                    trigger: title,
                    start: "top 80%",
                    end: "bottom 20%",
                    toggleActions: "play none none reverse"
                }
            }
        );
    });
    
    // About text animation
    gsap.utils.toArray('.about-text p').forEach((p, index) => {
        gsap.fromTo(p,
            {
                opacity: 0,
                y: 30
            },
            {
                opacity: 1,
                y: 0,
                duration: 0.8,
                delay: index * 0.2,
                ease: "power2.out",
                scrollTrigger: {
                    trigger: p,
                    start: "top 80%",
                    toggleActions: "play none none reverse"
                }
            }
        );
    });
    
    // Stats animation
    gsap.utils.toArray('.stat-item').forEach((stat, index) => {
        gsap.fromTo(stat,
            {
                opacity: 0,
                x: 50
            },
            {
                opacity: 1,
                x: 0,
                duration: 0.8,
                delay: index * 0.1,
                ease: "power2.out",
                scrollTrigger: {
                    trigger: stat,
                    start: "top 80%",
                    toggleActions: "play none none reverse"
                }
            }
        );
    });
    
    // Project cards animation
    gsap.utils.toArray('.project-card').forEach((card, index) => {
        gsap.fromTo(card,
            {
                opacity: 0,
                y: 60
            },
            {
                opacity: 1,
                y: 0,
                duration: 1,
                delay: index * 0.2,
                ease: "power2.out",
                scrollTrigger: {
                    trigger: card,
                    start: "top 80%",
                    toggleActions: "play none none reverse"
                }
            }
        );
    });
    
    // Gallery items animation
    gsap.utils.toArray('.gallery-item').forEach((item, index) => {
        gsap.fromTo(item,
            {
                opacity: 0,
                y: 40
            },
            {
                opacity: 1,
                y: 0,
                duration: 0.8,
                delay: index * 0.1,
                ease: "power2.out",
                scrollTrigger: {
                    trigger: item,
                    start: "top 85%",
                    toggleActions: "play none none reverse"
                }
            }
        );
    });
}

// Navigation
function initNavigation() {
    const nav = document.getElementById('navbar');
    
    // Smooth scroll for nav links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            if (href && href.startsWith('#')) {
                e.preventDefault();
                const targetSection = document.querySelector(href);
                
                if (targetSection) {
                    targetSection.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            }
        });
    });
}

// Mobile Navigation
function initMobileNavigation() {
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
        
        console.log('Mobile menu toggled:', isMenuOpen ? 'OPEN' : 'CLOSED');
    });

    // Handle mobile nav link clicks
    mobileLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            
            if (href && href.startsWith('#')) {
                e.preventDefault();
                
                // Close mobile menu first
                closeMobileMenu();
                
                // Then scroll to target with a small delay
                setTimeout(() => {
                    const targetSection = document.querySelector(href);
                    if (targetSection) {
                        targetSection.scrollIntoView({
                            behavior: 'smooth',
                            block: 'start'
                        });
                    }
                }, 300);
            }
        });
    });

    // Close mobile menu when clicking outside
    document.addEventListener('click', (e) => {
        if (isMenuOpen && !mobileMenu.contains(e.target) && !mobileToggle.contains(e.target)) {
            closeMobileMenu();
        }
    });

    // Close mobile menu on escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && isMenuOpen) {
            closeMobileMenu();
        }
    });

    // Close mobile menu on window resize (if switching to desktop)
    window.addEventListener('resize', () => {
        if (window.innerWidth > 768 && isMenuOpen) {
            closeMobileMenu();
        }
    });

    function closeMobileMenu() {
        isMenuOpen = false;
        mobileToggle.classList.remove('active');
        mobileMenu.classList.remove('active');
        document.body.style.overflow = 'auto';
    }

    // Handle orientation change on mobile devices
    window.addEventListener('orientationchange', () => {
        setTimeout(() => {
            if (isMenuOpen) {
                // Recalculate menu height after orientation change
                mobileMenu.style.height = '100vh';
            }
        }, 100);
    });

    // Add touch event handling for better mobile experience
    let touchStartY = 0;
    let touchEndY = 0;

    mobileMenu.addEventListener('touchstart', (e) => {
        touchStartY = e.changedTouches[0].screenY;
    });

    mobileMenu.addEventListener('touchend', (e) => {
        touchEndY = e.changedTouches[0].screenY;
        
        // Close menu if swiped up significantly
        if (touchStartY - touchEndY > 100) {
            closeMobileMenu();
        }
    });

    console.log('Mobile navigation initialized');
}

// 3D Model Viewer Functions using Three.js
let scene, camera, renderer, carModel, controls;
let isWireframe = false;
let isExploded = false;
let originalPositions = [];
let currentSTLFile = null;
let isSTLModel = false;

function initModelViewer() {
    // Initialize Three.js scene
    console.log('Initializing Three.js 3D model viewer');
}

function loadModel() {
    const viewerContainer = document.getElementById('modelViewer');
    
    if (!viewerContainer) {
        console.error('Model viewer container not found');
        return;
    }
    
    // Clear any existing content
    viewerContainer.innerHTML = '';
    
    // Create Three.js scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a1a);
    
    // Create camera
    camera = new THREE.PerspectiveCamera(75, viewerContainer.clientWidth / viewerContainer.clientHeight, 0.1, 1000);
    camera.position.set(5, 3, 5);
    
    // Create renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(viewerContainer.clientWidth, viewerContainer.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    viewerContainer.appendChild(renderer.domElement);
    
    // Add lights
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 10, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    scene.add(directionalLight);
    
    const pointLight = new THREE.PointLight(0x2af0ff, 0.5, 100);
    pointLight.position.set(-5, 5, -5);
    scene.add(pointLight);
    
    // Create Heritage H2GP car model
    createH2GPCar();
    
    // Add orbit controls
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.screenSpacePanning = false;
    controls.minDistance = 2;
    controls.maxDistance = 20;
    controls.maxPolarAngle = Math.PI / 2;
    
    // Add Japanese street environment
    createJapaneseStreet();
    
    // Start animation loop
    animate();
    
    // Handle window resize
    window.addEventListener('resize', onWindowResize, false);
    
    console.log('Heritage H2GP 3D model loaded successfully');
}

function createH2GPCar() {
    // Create car group
    carModel = new THREE.Group();
    
    // Car body (main chassis)
    const bodyGeometry = new THREE.BoxGeometry(3, 0.3, 1.2);
    const bodyMaterial = new THREE.MeshPhongMaterial({ 
        color: 0x2af0ff,
        shininess: 100,
        transparent: true,
        opacity: 0.9
    });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = 0.5;
    body.castShadow = true;
    carModel.add(body);
    
    // Front nose cone
    const noseGeometry = new THREE.ConeGeometry(0.3, 1, 8);
    const noseMaterial = new THREE.MeshPhongMaterial({ color: 0x0099cc });
    const nose = new THREE.Mesh(noseGeometry, noseMaterial);
    nose.rotation.z = Math.PI / 2;
    nose.position.set(2, 0.5, 0);
    nose.castShadow = true;
    carModel.add(nose);
    
    // Rear wing
    const wingGeometry = new THREE.BoxGeometry(0.1, 0.8, 1.5);
    const wingMaterial = new THREE.MeshPhongMaterial({ color: 0x006699 });
    const wing = new THREE.Mesh(wingGeometry, wingMaterial);
    wing.position.set(-1.8, 1.2, 0);
    wing.castShadow = true;
    carModel.add(wing);
    
    // Wing supports
    for (let i = -0.6; i <= 0.6; i += 1.2) {
        const supportGeometry = new THREE.CylinderGeometry(0.02, 0.02, 0.7);
        const supportMaterial = new THREE.MeshPhongMaterial({ color: 0x333333 });
        const support = new THREE.Mesh(supportGeometry, supportMaterial);
        support.position.set(-1.8, 0.85, i);
        carModel.add(support);
    }
    
    // Wheels
    const wheelPositions = [
        { x: 1.2, y: 0.2, z: 0.8 },   // Front right
        { x: 1.2, y: 0.2, z: -0.8 },  // Front left
        { x: -1.2, y: 0.2, z: 0.8 },  // Rear right
        { x: -1.2, y: 0.2, z: -0.8 }  // Rear left
    ];
    
    wheelPositions.forEach(pos => {
        const wheelGeometry = new THREE.CylinderGeometry(0.3, 0.3, 0.15);
        const wheelMaterial = new THREE.MeshPhongMaterial({ color: 0x222222 });
        const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
        wheel.rotation.z = Math.PI / 2;
        wheel.position.set(pos.x, pos.y, pos.z);
        wheel.castShadow = true;
        carModel.add(wheel);
        
        // Wheel rims
        const rimGeometry = new THREE.CylinderGeometry(0.25, 0.25, 0.16);
        const rimMaterial = new THREE.MeshPhongMaterial({ color: 0x666666 });
        const rim = new THREE.Mesh(rimGeometry, rimMaterial);
        rim.rotation.z = Math.PI / 2;
        rim.position.set(pos.x, pos.y, pos.z);
        carModel.add(rim);
    });
    
    // Hydrogen fuel cell (distinctive feature)
    const fuelCellGeometry = new THREE.CylinderGeometry(0.2, 0.2, 0.8);
    const fuelCellMaterial = new THREE.MeshPhongMaterial({ 
        color: 0x00ff88,
        emissive: 0x002211
    });
    const fuelCell = new THREE.Mesh(fuelCellGeometry, fuelCellMaterial);
    fuelCell.position.set(0, 0.8, 0);
    fuelCell.castShadow = true;
    carModel.add(fuelCell);
    
    // Driver cockpit
    const cockpitGeometry = new THREE.SphereGeometry(0.4, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2);
    const cockpitMaterial = new THREE.MeshPhongMaterial({ 
        color: 0x111111,
        transparent: true,
        opacity: 0.7
    });
    const cockpit = new THREE.Mesh(cockpitGeometry, cockpitMaterial);
    cockpit.position.set(0.5, 0.8, 0);
    carModel.add(cockpit);
    
    // Store original positions for explode effect
    carModel.children.forEach(child => {
        originalPositions.push({
            object: child,
            position: child.position.clone()
        });
    });
    
    scene.add(carModel);
}

function createJapaneseStreet() {
    // Create Japanese street environment group
    const streetGroup = new THREE.Group();
    
    // Main street surface with Japanese-style asphalt
    const streetGeometry = new THREE.PlaneGeometry(20, 8);
    const streetMaterial = new THREE.MeshLambertMaterial({ 
        color: 0x2a2a2a,
        transparent: true,
        opacity: 0.95
    });
    const street = new THREE.Mesh(streetGeometry, streetMaterial);
    street.rotation.x = -Math.PI / 2;
    street.receiveShadow = true;
    streetGroup.add(street);
    
    // Japanese-style lane markings (white dashed lines)
    const dashGeometry = new THREE.PlaneGeometry(1, 0.08);
    const dashMaterial = new THREE.MeshBasicMaterial({ 
        color: 0xffffff,
        transparent: true,
        opacity: 0.9
    });
    
    // Center dashed line
    for (let i = -8; i <= 8; i += 2) {
        const dash = new THREE.Mesh(dashGeometry, dashMaterial);
        dash.rotation.x = -Math.PI / 2;
        dash.position.set(i, 0.01, 0);
        streetGroup.add(dash);
    }
    
    // Side lane markings
    const sideLineGeometry = new THREE.PlaneGeometry(16, 0.1);
    const sideLineMaterial = new THREE.MeshBasicMaterial({ 
        color: 0xffffff,
        transparent: true,
        opacity: 0.7
    });
    
    const leftSideLine = new THREE.Mesh(sideLineGeometry, sideLineMaterial);
    leftSideLine.rotation.x = -Math.PI / 2;
    leftSideLine.position.set(0, 0.01, -3.5);
    streetGroup.add(leftSideLine);
    
    const rightSideLine = new THREE.Mesh(sideLineGeometry, sideLineMaterial);
    rightSideLine.rotation.x = -Math.PI / 2;
    rightSideLine.position.set(0, 0.01, 3.5);
    streetGroup.add(rightSideLine);
    
    // Japanese-style buildings (simplified)
    const buildingMaterial = new THREE.MeshPhongMaterial({ color: 0x4a4a4a });
    const buildingMaterial2 = new THREE.MeshPhongMaterial({ color: 0x5a5a5a });
    
    // Left side buildings
    for (let i = 0; i < 3; i++) {
        const buildingGeometry = new THREE.BoxGeometry(4, 6 + Math.random() * 4, 3);
        const building = new THREE.Mesh(buildingGeometry, i % 2 === 0 ? buildingMaterial : buildingMaterial2);
        building.position.set(-12 + i * 4, 3, -8);
        building.castShadow = true;
        streetGroup.add(building);
        
        // Add some windows (glowing rectangles)
        const windowMaterial = new THREE.MeshBasicMaterial({ 
            color: 0xffff88,
            transparent: true,
            opacity: 0.6
        });
        
        for (let j = 0; j < 3; j++) {
            const windowGeometry = new THREE.PlaneGeometry(0.8, 1.2);
            const window = new THREE.Mesh(windowGeometry, windowMaterial);
            window.position.set(-12 + i * 4, 2 + j * 2, -6.5);
            streetGroup.add(window);
        }
    }
    
    // Right side buildings
    for (let i = 0; i < 3; i++) {
        const buildingGeometry = new THREE.BoxGeometry(4, 5 + Math.random() * 3, 3);
        const building = new THREE.Mesh(buildingGeometry, i % 2 === 0 ? buildingMaterial2 : buildingMaterial);
        building.position.set(-12 + i * 4, 2.5, 8);
        building.castShadow = true;
        streetGroup.add(building);
        
        // Add windows
        const windowMaterial = new THREE.MeshBasicMaterial({ 
            color: 0xffaa44,
            transparent: true,
            opacity: 0.5
        });
        
        for (let j = 0; j < 2; j++) {
            const windowGeometry = new THREE.PlaneGeometry(0.8, 1.2);
            const window = new THREE.Mesh(windowGeometry, windowMaterial);
            window.position.set(-12 + i * 4, 1.5 + j * 2, 6.5);
            streetGroup.add(window);
        }
    }
    
    // Japanese-style street lamps
    const lampPostMaterial = new THREE.MeshPhongMaterial({ color: 0x333333 });
    const lampLightMaterial = new THREE.MeshBasicMaterial({ 
        color: 0xffffaa,
        transparent: true,
        opacity: 0.8
    });
    
    // Left side lamp
    const lampPostGeometry = new THREE.CylinderGeometry(0.1, 0.1, 4);
    const leftLampPost = new THREE.Mesh(lampPostGeometry, lampPostMaterial);
    leftLampPost.position.set(-6, 2, -5);
    streetGroup.add(leftLampPost);
    
    const lampGeometry = new THREE.SphereGeometry(0.3);
    const leftLamp = new THREE.Mesh(lampGeometry, lampLightMaterial);
    leftLamp.position.set(-6, 4, -5);
    streetGroup.add(leftLamp);
    
    // Right side lamp
    const rightLampPost = new THREE.Mesh(lampPostGeometry, lampPostMaterial);
    rightLampPost.position.set(6, 2, 5);
    streetGroup.add(rightLampPost);
    
    const rightLamp = new THREE.Mesh(lampGeometry, lampLightMaterial);
    rightLamp.position.set(6, 4, 5);
    streetGroup.add(rightLamp);
    
    // Add some Japanese-style details (vending machines)
    const vendingMachineMaterial = new THREE.MeshPhongMaterial({ color: 0x0066cc });
    const vendingMachineGeometry = new THREE.BoxGeometry(1, 2, 0.8);
    const vendingMachine = new THREE.Mesh(vendingMachineGeometry, vendingMachineMaterial);
    vendingMachine.position.set(-8, 1, -6);
    vendingMachine.castShadow = true;
    streetGroup.add(vendingMachine);
    
    // Vending machine screen
    const screenMaterial = new THREE.MeshBasicMaterial({ 
        color: 0x00aaff,
        transparent: true,
        opacity: 0.7
    });
    const screenGeometry = new THREE.PlaneGeometry(0.6, 0.8);
    const screen = new THREE.Mesh(screenGeometry, screenMaterial);
    screen.position.set(-8, 1.5, -5.6);
    streetGroup.add(screen);
    
    // Sidewalks
    const sidewalkMaterial = new THREE.MeshLambertMaterial({ color: 0x666666 });
    const sidewalkGeometry = new THREE.PlaneGeometry(20, 1.5);
    
    const leftSidewalk = new THREE.Mesh(sidewalkGeometry, sidewalkMaterial);
    leftSidewalk.rotation.x = -Math.PI / 2;
    leftSidewalk.position.set(0, 0.02, -5.25);
    leftSidewalk.receiveShadow = true;
    streetGroup.add(leftSidewalk);
    
    const rightSidewalk = new THREE.Mesh(sidewalkGeometry, sidewalkMaterial);
    rightSidewalk.rotation.x = -Math.PI / 2;
    rightSidewalk.position.set(0, 0.02, 5.25);
    rightSidewalk.receiveShadow = true;
    streetGroup.add(rightSidewalk);
    
    scene.add(streetGroup);
}

function animate() {
    requestAnimationFrame(animate);
    
    if (controls) {
        controls.update();
    }
    
    // Rotate the car slightly for visual appeal (only for default model, not STL)
    if (carModel && !isExploded && !isSTLModel) {
        carModel.rotation.y += 0.005;
    }
    
    if (renderer && scene && camera) {
        renderer.render(scene, camera);
    }
}

function onWindowResize() {
    const viewerContainer = document.getElementById('modelViewer');
    if (viewerContainer && camera && renderer) {
        camera.aspect = viewerContainer.clientWidth / viewerContainer.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(viewerContainer.clientWidth, viewerContainer.clientHeight);
    }
}

function resetView() {
    if (camera && controls) {
        camera.position.set(5, 3, 5);
        controls.reset();
        console.log('View reset to default position');
    }
}

function toggleWireframe() {
    if (carModel) {
        isWireframe = !isWireframe;
        carModel.traverse((child) => {
            if (child.isMesh) {
                child.material.wireframe = isWireframe;
            }
        });
        console.log('Wireframe mode:', isWireframe ? 'ON' : 'OFF');
    }
}

function toggleExplode() {
    if (carModel && originalPositions.length > 0) {
        isExploded = !isExploded;
        
        originalPositions.forEach(item => {
            if (isExploded) {
                // Explode: move parts away from center
                const direction = item.position.clone().normalize();
                const explodeDistance = 2;
                item.object.position.copy(item.position.clone().add(direction.multiplyScalar(explodeDistance)));
            } else {
                // Implode: return to original positions
                item.object.position.copy(item.position);
            }
        });
        
        console.log('Explode mode:', isExploded ? 'ON' : 'OFF');
    }
}

// Add default photos from Heritage H2GP website
function addDefaultPhotos() {
    // Only add default photos if none exist
    if (photos.length > 0) return;
    
    const defaultPhotos = [
        {
            id: 1,
            title: "Heritage H2GP Team at California Competition",
            description: "Our team proudly representing Heritage High School at the California H2GP competition, showcasing our hydrogen-powered RC car and team spirit.",
            category: "team",
            src: "https://static.wixstatic.com/media/034938_09ea47c7cfa2459d99ff11a8d8cfc3cf~mv2.jpg/v1/fill/w_800,h_313,fp_0.50_0.41,q_80,usm_0.66_1.00_0.01,enc_avif,quality_auto/034938_09ea47c7cfa2459d99ff11a8d8cfc3cf~mv2.jpg",
            timestamp: new Date().toISOString()
        },
        {
            id: 2,
            title: "Thomas Mason with Our Racing Car",
            description: "Team member Thomas Mason making final adjustments to our hydrogen-powered RC car before competition. Attention to detail is crucial for optimal performance.",
            category: "cars",
            src: "https://static.wixstatic.com/media/b0cd35_e087c6ca92c940978fd53312b529159e~mv2.jpg/v1/fill/w_392,h_303,fp_0.68_0.12,q_80,usm_0.66_1.00_0.01,enc_avif,quality_auto/ThomasMasonTouchingRaceCarImg.jpg",
            timestamp: new Date().toISOString()
        },
        {
            id: 3,
            title: "Our Car at Nationals Competition",
            description: "Heritage H2GP's hydrogen-powered RC car competing at the national level, demonstrating our engineering excellence and sustainable energy innovation.",
            category: "racing",
            src: "https://static.wixstatic.com/media/fd4e06_f8591a7a6fc14e249ae2998e97bb66e7~mv2.webp/v1/fill/w_399,h_242,al_c,q_80,usm_0.66_1.00_0.01,enc_avif,quality_auto/main%20car%20image%20at%20nationals.webp",
            timestamp: new Date().toISOString()
        },
        {
            id: 4,
            title: "Hydrogen Technology Education",
            description: "Learning about hydrogen fuel cell technology and sustainable energy solutions through hands-on STEAM education and engineering projects.",
            category: "education",
            src: "https://static.wixstatic.com/media/034938_5d2ced0d0c124547b077579f3ab4da5c~mv2.png/v1/fill/w_184,h_184,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/GettyImages-1823979425_b.png",
            timestamp: new Date().toISOString()
        }
    ];
    
    // Add default photos to the photos array
    photos = defaultPhotos;
    localStorage.setItem('h2gp-photos', JSON.stringify(photos));
}

// Photo Gallery Functions
function initPhotoGallery() {
    // Filter buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class from all buttons
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            // Add active class to clicked button
            btn.classList.add('active');
            
            const filter = btn.getAttribute('data-filter');
            filterPhotos(filter);
        });
    });
    
    // Upload area drag and drop
    const uploadArea = document.getElementById('uploadArea');
    const photoInput = document.getElementById('photoInput');
    
    if (uploadArea && photoInput) {
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.classList.add('dragover');
        });
        
        uploadArea.addEventListener('dragleave', () => {
            uploadArea.classList.remove('dragover');
        });
        
        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('dragover');
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                handleFileSelect(files[0]);
            }
        });
        
        uploadArea.addEventListener('click', () => {
            photoInput.click();
        });
        
        photoInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                handleFileSelect(e.target.files[0]);
            }
        });
    }
}

function handleFileSelect(file) {
    if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const preview = document.getElementById('photoPreview');
            const uploadArea = document.getElementById('uploadArea');
            const photoDetails = document.getElementById('photoDetails');
            
            preview.src = e.target.result;
            uploadArea.style.display = 'none';
            photoDetails.style.display = 'grid';
        };
        reader.readAsDataURL(file);
    }
}

function openPhotoModal() {
    document.getElementById('photoModal').style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function closePhotoModal() {
    document.getElementById('photoModal').style.display = 'none';
    document.body.style.overflow = 'auto';
    resetUploadForm();
}

function resetUploadForm() {
    const uploadArea = document.getElementById('uploadArea');
    const photoDetails = document.getElementById('photoDetails');
    const photoInput = document.getElementById('photoInput');
    
    uploadArea.style.display = 'block';
    photoDetails.style.display = 'none';
    photoInput.value = '';
    
    // Clear form fields
    document.getElementById('photoTitle').value = '';
    document.getElementById('photoDescription').value = '';
    document.getElementById('photoCategory').value = 'cars';
}

function uploadPhoto() {
    const title = document.getElementById('photoTitle').value;
    const description = document.getElementById('photoDescription').value;
    const category = document.getElementById('photoCategory').value;
    const preview = document.getElementById('photoPreview');
    
    if (!title.trim()) {
        showNotification('Please enter a photo title', 'error');
        return;
    }
    
    const photo = {
        id: Date.now(),
        title: title.trim(),
        description: description.trim(),
        category: category,
        src: preview.src,
        timestamp: new Date().toISOString()
    };
    
    photos.push(photo);
    localStorage.setItem('h2gp-photos', JSON.stringify(photos));
    
    showNotification('Photo uploaded successfully!', 'success');
    closePhotoModal();
    loadPhotos();
}

function loadPhotos() {
    const galleryGrid = document.getElementById('galleryGrid');
    const placeholder = galleryGrid.querySelector('.gallery-placeholder');
    
    if (photos.length === 0) {
        if (placeholder) placeholder.style.display = 'flex';
        return;
    }
    
    if (placeholder) placeholder.style.display = 'none';
    
    // Clear existing photos (except placeholder)
    const existingPhotos = galleryGrid.querySelectorAll('.gallery-item');
    existingPhotos.forEach(item => item.remove());
    
    photos.forEach((photo, index) => {
        const photoElement = createPhotoElement(photo, index);
        galleryGrid.appendChild(photoElement);
    });
    
    // Trigger animations for new photos
    gsap.utils.toArray('.gallery-item').forEach((item, index) => {
        gsap.fromTo(item,
            {
                opacity: 0,
                y: 40
            },
            {
                opacity: 1,
                y: 0,
                duration: 0.6,
                delay: index * 0.1,
                ease: "power2.out"
            }
        );
    });
}

function createPhotoElement(photo, index) {
    const photoDiv = document.createElement('div');
    photoDiv.className = 'gallery-item';
    photoDiv.setAttribute('data-category', photo.category);
    photoDiv.onclick = () => openImageViewer(index);
    
    photoDiv.innerHTML = `
        <img src="${photo.src}" alt="${photo.title}" class="gallery-image">
        <div class="gallery-info">
            <h3>${photo.title}</h3>
            <p>${photo.description}</p>
            <span class="category-tag">${photo.category}</span>
        </div>
    `;
    
    return photoDiv;
}

function filterPhotos(filter) {
    const galleryItems = document.querySelectorAll('.gallery-item');
    
    galleryItems.forEach(item => {
        const category = item.getAttribute('data-category');
        
        if (filter === 'all' || category === filter) {
            item.classList.remove('hidden');
            gsap.fromTo(item,
                {
                    opacity: 0,
                    scale: 0.8
                },
                {
                    opacity: 1,
                    scale: 1,
                    duration: 0.5,
                    ease: "power2.out"
                }
            );
        } else {
            gsap.to(item, {
                opacity: 0,
                scale: 0.8,
                duration: 0.3,
                ease: "power2.in",
                onComplete: () => {
                    item.classList.add('hidden');
                }
            });
        }
    });
}

function openImageViewer(index) {
    currentImageIndex = index;
    const photo = photos[index];
    
    document.getElementById('viewerImage').src = photo.src;
    document.getElementById('viewerTitle').textContent = photo.title;
    document.getElementById('viewerDescription').textContent = photo.description;
    document.getElementById('viewerCategory').textContent = photo.category;
    
    document.getElementById('imageViewerModal').style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function closeImageViewer() {
    document.getElementById('imageViewerModal').style.display = 'none';
    document.body.style.overflow = 'auto';
}

function previousImage() {
    if (photos.length === 0) return;
    
    currentImageIndex = (currentImageIndex - 1 + photos.length) % photos.length;
    const photo = photos[currentImageIndex];
    
    // Animate transition
    gsap.to('#viewerImage', {
        opacity: 0,
        duration: 0.2,
        onComplete: () => {
            document.getElementById('viewerImage').src = photo.src;
            document.getElementById('viewerTitle').textContent = photo.title;
            document.getElementById('viewerDescription').textContent = photo.description;
            document.getElementById('viewerCategory').textContent = photo.category;
            
            gsap.to('#viewerImage', {
                opacity: 1,
                duration: 0.2
            });
        }
    });
}

function nextImage() {
    if (photos.length === 0) return;
    
    currentImageIndex = (currentImageIndex + 1) % photos.length;
    const photo = photos[currentImageIndex];
    
    // Animate transition
    gsap.to('#viewerImage', {
        opacity: 0,
        duration: 0.2,
        onComplete: () => {
            document.getElementById('viewerImage').src = photo.src;
            document.getElementById('viewerTitle').textContent = photo.title;
            document.getElementById('viewerDescription').textContent = photo.description;
            document.getElementById('viewerCategory').textContent = photo.category;
            
            gsap.to('#viewerImage', {
                opacity: 1,
                duration: 0.2
            });
        }
    });
}

function openImageUpload(category) {
    document.getElementById('photoCategory').value = category;
    openPhotoModal();
}

function showNotification(message, type = 'success') {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(n => n.remove());
    
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Animate in
    gsap.fromTo(notification,
        {
            x: 400,
            opacity: 0
        },
        {
            x: 0,
            opacity: 1,
            duration: 0.5,
            ease: "power2.out"
        }
    );
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        gsap.to(notification, {
            x: 400,
            opacity: 0,
            duration: 0.5,
            ease: "power2.in",
            onComplete: () => {
                notification.remove();
            }
        });
    }, 3000);
}

// Performance optimization: Pause video when not visible
document.addEventListener('visibilitychange', () => {
    const video = document.getElementById('hero-video');
    if (video) {
        if (document.hidden) {
            video.pause();
        } else {
            video.play().catch(error => {
                console.log('Video resume failed:', error);
            });
        }
    }
});

// Permanent Models Configuration
let permanentModels = [];

// STL Model Functions
function openSTLModal() {
    document.getElementById('stlModal').style.display = 'block';
    document.body.style.overflow = 'hidden';
    initSTLUpload();
    loadPermanentModels();
}

function closeSTLModal() {
    document.getElementById('stlModal').style.display = 'none';
    document.body.style.overflow = 'auto';
    resetSTLForm();
}

function initSTLUpload() {
    const stlUploadArea = document.getElementById('stlUploadArea');
    const stlInput = document.getElementById('stlInput');
    
    if (stlUploadArea && stlInput) {
        // Drag and drop functionality
        stlUploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            stlUploadArea.classList.add('dragover');
        });
        
        stlUploadArea.addEventListener('dragleave', () => {
            stlUploadArea.classList.remove('dragover');
        });
        
        stlUploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            stlUploadArea.classList.remove('dragover');
            const files = e.dataTransfer.files;
            if (files.length > 0 && files[0].name.toLowerCase().endsWith('.stl')) {
                handleSTLFileSelect(files[0]);
            } else {
                showNotification('Please select a valid STL file', 'error');
            }
        });
        
        stlUploadArea.addEventListener('click', () => {
            stlInput.click();
        });
        
        stlInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                const file = e.target.files[0];
                if (file.name.toLowerCase().endsWith('.stl')) {
                    handleSTLFileSelect(file);
                } else {
                    showNotification('Please select a valid STL file', 'error');
                }
            }
        });
    }
}

function handleSTLFileSelect(file) {
    if (file && file.name.toLowerCase().endsWith('.stl')) {
        currentSTLFile = file;
        
        // Update UI to show file details
        const stlUploadArea = document.getElementById('stlUploadArea');
        const stlDetails = document.getElementById('stlDetails');
        const stlFileName = document.getElementById('stlFileName');
        const stlFileSize = document.getElementById('stlFileSize');
        
        stlFileName.textContent = file.name;
        stlFileSize.textContent = (file.size / (1024 * 1024)).toFixed(2) + ' MB';
        
        stlUploadArea.style.display = 'none';
        stlDetails.style.display = 'block';
        
        showNotification('STL file selected successfully!', 'success');
    }
}

function resetSTLForm() {
    const stlUploadArea = document.getElementById('stlUploadArea');
    const stlDetails = document.getElementById('stlDetails');
    const stlInput = document.getElementById('stlInput');
    
    stlUploadArea.style.display = 'block';
    stlDetails.style.display = 'none';
    stlInput.value = '';
    currentSTLFile = null;
    
    // Reset form fields to defaults
    document.getElementById('modelTitle').value = 'Heritage H2GP Car';
    document.getElementById('modelDescription').value = 'Our hydrogen-powered RC car designed for H2GP competition';
}

function loadSTLModel() {
    if (!currentSTLFile) {
        showNotification('Please select an STL file first', 'error');
        return;
    }
    
    const title = document.getElementById('modelTitle').value;
    const description = document.getElementById('modelDescription').value;
    
    if (!title.trim()) {
        showNotification('Please enter a model name', 'error');
        return;
    }
    
    showNotification('Uploading STL model to cloud storage...', 'info');
    
    // Upload to cloud storage first
    uploadSTLToCloud(currentSTLFile, title, description)
        .then(uploadResult => {
            showNotification('STL model uploaded successfully! Loading...', 'success');
            
            // Now load the model from the cloud URL
            loadSTLFromURL(uploadResult.fileUrl, title, description);
        })
        .catch(error => {
            console.error('Upload error:', error);
            showNotification('Failed to upload STL model. Loading locally...', 'error');
            
            // Fallback to local loading
            loadSTLLocally(currentSTLFile, title, description);
        });
}

async function uploadSTLToCloud(file, title, description) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', title);
    formData.append('description', description);
    
    const response = await fetch('/.netlify/functions/upload-stl', {
        method: 'POST',
        body: formData
    });
    
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
    }
    
    return await response.json();
}

function loadSTLFromURL(url, title, description) {
    const loader = new THREE.STLLoader();
    
    loader.load(
        url,
        function(geometry) {
            // Clear existing model
            if (carModel) {
                scene.remove(carModel);
                originalPositions = [];
            }
            
            // Create material for the STL model
            const material = new THREE.MeshPhongMaterial({
                color: 0x2af0ff,
                shininess: 100,
                transparent: true,
                opacity: 0.9
            });
            
            // Create mesh
            carModel = new THREE.Mesh(geometry, material);
            carModel.castShadow = true;
            carModel.receiveShadow = true;
            
            // Center and scale the model
            const box = new THREE.Box3().setFromObject(carModel);
            const center = box.getCenter(new THREE.Vector3());
            const size = box.getSize(new THREE.Vector3());
            
            // Center the model horizontally and position on road
            carModel.position.sub(center);
            
            // Scale the model to fit nicely in the viewer
            const maxDimension = Math.max(size.x, size.y, size.z);
            const scale = 3 / maxDimension; // Scale to fit in a 3-unit space
            carModel.scale.setScalar(scale);
            
            // Position the model in the center of the road
            carModel.position.set(0, 0.5, 0);
            
            // Store original position for explode effect
            originalPositions = [{
                object: carModel,
                position: carModel.position.clone()
            }];
            
            // Add to scene
            scene.add(carModel);
            
            // Update flags
            isSTLModel = true;
            isWireframe = false;
            isExploded = false;
            
            // Reset camera position for better view
            camera.position.set(5, 3, 5);
            controls.reset();
            
            // Save the current STL model info to localStorage for persistence
            saveCurrentSTLModel({
                url: url,
                title: title,
                description: description,
                loadedFrom: 'cloud'
            });
            
            showNotification(`STL model "${title}" loaded from cloud storage!`, 'success');
            closeSTLModal();
            
            console.log('STL model loaded from cloud:', title, url);
        },
        function(progress) {
            if (progress.total && progress.total > 0) {
                console.log('Loading progress:', (progress.loaded / progress.total * 100).toFixed(1) + '%');
            } else {
                console.log('Loading progress: ' + (progress.loaded / 1024).toFixed(1) + ' KB loaded');
            }
        },
        function(error) {
            console.error('Error loading STL from URL:', error);
            showNotification('Error loading STL from cloud. Trying local fallback...', 'error');
            
            // Fallback to local loading
            loadSTLLocally(currentSTLFile, title, description);
        }
    );
}

function loadSTLLocally(file, title, description) {
    const reader = new FileReader();
    reader.onload = function(event) {
        const arrayBuffer = event.target.result;
        
        // Clear existing model
        if (carModel) {
            scene.remove(carModel);
            originalPositions = [];
        }
        
        // Load STL using Three.js STLLoader
        const loader = new THREE.STLLoader();
        
        try {
            const geometry = loader.parse(arrayBuffer);
            
            // Create material for the STL model
            const material = new THREE.MeshPhongMaterial({
                color: 0x2af0ff,
                shininess: 100,
                transparent: true,
                opacity: 0.9
            });
            
            // Create mesh
            carModel = new THREE.Mesh(geometry, material);
            carModel.castShadow = true;
            carModel.receiveShadow = true;
            
            // Center and scale the model
            const box = new THREE.Box3().setFromObject(carModel);
            const center = box.getCenter(new THREE.Vector3());
            const size = box.getSize(new THREE.Vector3());
            
            // Center the model horizontally and position on road
            carModel.position.sub(center);
            
            // Scale the model to fit nicely in the viewer
            const maxDimension = Math.max(size.x, size.y, size.z);
            const scale = 3 / maxDimension; // Scale to fit in a 3-unit space
            carModel.scale.setScalar(scale);
            
            // Position the model in the center of the road
            carModel.position.set(0, 0.5, 0);
            
            // Store original position for explode effect
            originalPositions = [{
                object: carModel,
                position: carModel.position.clone()
            }];
            
            // Add to scene
            scene.add(carModel);
            
            // Update flags
            isSTLModel = true;
            isWireframe = false;
            isExploded = false;
            
            // Reset camera position for better view
            camera.position.set(5, 3, 5);
            controls.reset();
            
            showNotification(`STL model "${title}" loaded locally!`, 'success');
            closeSTLModal();
            
            console.log('STL model loaded locally:', title);
            
        } catch (error) {
            console.error('Error loading STL file:', error);
            showNotification('Error loading STL file. Please check the file format.', 'error');
        }
    };
    
    reader.onerror = function() {
        showNotification('Error reading STL file', 'error');
    };
    
    reader.readAsArrayBuffer(file);
}


// Permanent Models Functions
async function loadPermanentModels() {
    try {
        console.log('Attempting to load permanent models configuration...');
        
        const response = await fetch('assets/models/models-config.json');
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const config = await response.json();
        permanentModels = config.models;
        
        // Update the STL modal to show permanent models
        updateSTLModalWithPermanentModels();
        
        console.log('Loaded permanent models:', permanentModels);
    } catch (error) {
        console.error('Error loading permanent models:', error);
        
        // Provide fallback configuration for when models-config.json can't be loaded
        permanentModels = [
            {
                id: "heritage-h2gp-2024",
                name: "Heritage H2GP Car 2024",
                description: "Our latest hydrogen-powered RC car design for the 2024 competition season",
                filename: "heritage-h2gp-2024.stl",
                category: "competition",
                year: 2024,
                isDefault: true
            }
        ];
        
        console.log('Using fallback permanent models configuration');
        updateSTLModalWithPermanentModels();
    }
}

function updateSTLModalWithPermanentModels() {
    const permanentSection = document.getElementById('permanentModelsSection');
    if (!permanentSection) return;
    
    permanentSection.innerHTML = `
        <h3 style="color: #2af0ff; margin-bottom: 20px; text-align: center;">Heritage H2GP Models</h3>
        <div class="permanent-models-grid">
            ${permanentModels.map(model => `
                <div class="permanent-model-card" onclick="loadPermanentModel('${model.id}')">
                    <div class="model-info">
                        <h4>${model.name}</h4>
                        <p>${model.description}</p>
                        <div class="model-meta">
                            <span class="model-category">${model.category}</span>
                            <span class="model-year">${model.year}</span>
                            ${model.isDefault ? '<span class="default-badge">Default</span>' : ''}
                        </div>
                    </div>
                </div>
            `).join('')}
        </div>
        <div class="section-divider">
            <span>OR</span>
        </div>
    `;
}

function loadPermanentModel(modelId) {
    const model = permanentModels.find(m => m.id === modelId);
    if (!model) {
        showNotification('Model not found', 'error');
        return;
    }
    
    const modelUrl = `assets/models/${model.filename}`;
    
    showNotification(`Loading ${model.name}...`, 'info');
    
    // Load the permanent STL model
    loadSTLFromURL(modelUrl, model.name, model.description)
        .then(() => {
            // Save the permanent model info
            saveCurrentSTLModel({
                url: modelUrl,
                title: model.name,
                description: model.description,
                loadedFrom: 'permanent',
                modelId: model.id
            });
            
            closeSTLModal();
        })
        .catch(error => {
            console.error('Error loading permanent model:', error);
            showNotification(`Error loading ${model.name}. File may not be uploaded yet.`, 'error');
        });
}

function loadSTLFromURL(url, title, description) {
    return new Promise((resolve, reject) => {
        const loader = new THREE.STLLoader();
        
        loader.load(
            url,
            function(geometry) {
                // Clear existing model
                if (carModel) {
                    scene.remove(carModel);
                    originalPositions = [];
                }
                
                // Create material for the STL model
                const material = new THREE.MeshPhongMaterial({
                    color: 0x2af0ff,
                    shininess: 100,
                    transparent: true,
                    opacity: 0.9
                });
                
                // Create mesh
                carModel = new THREE.Mesh(geometry, material);
                carModel.castShadow = true;
                carModel.receiveShadow = true;
                
                // Center and scale the model
                const box = new THREE.Box3().setFromObject(carModel);
                const center = box.getCenter(new THREE.Vector3());
                const size = box.getSize(new THREE.Vector3());
                
                // Center the model horizontally and position on road
                carModel.position.sub(center);
                
                // Scale the model to fit nicely in the viewer
                const maxDimension = Math.max(size.x, size.y, size.z);
                const scale = 3 / maxDimension; // Scale to fit in a 3-unit space
                carModel.scale.setScalar(scale);
                
                // Position the model in the center of the road
                carModel.position.set(0, 0.5, 0);
                
                // Store original position for explode effect
                originalPositions = [{
                    object: carModel,
                    position: carModel.position.clone()
                }];
                
                // Add to scene
                scene.add(carModel);
                
                // Update flags
                isSTLModel = true;
                isWireframe = false;
                isExploded = false;
                
                // Reset camera position for better view
                camera.position.set(5, 3, 5);
                controls.reset();
                
                showNotification(`STL model "${title}" loaded successfully!`, 'success');
                console.log('STL model loaded:', title, url);
                
                resolve();
            },
            function(progress) {
                if (progress.total && progress.total > 0) {
                    console.log('Loading progress:', (progress.loaded / progress.total * 100).toFixed(1) + '%');
                } else {
                    console.log('Loading progress: ' + (progress.loaded / 1024).toFixed(1) + ' KB loaded');
                }
            },
            function(error) {
                console.error('Error loading STL from URL:', error);
                reject(error);
            }
        );
    });
}

// Heritage H2GP Model Auto-Load Function
function loadHeritageH2GPModel() {
    // Wait for the scene to be fully initialized
    setTimeout(() => {
        const modelTitle = 'Heritage H2GP Car 2024';
        const modelDescription = 'Our latest hydrogen-powered RC car design for the 2024 competition season';
        
        // Check if we're running from file:// protocol
        if (window.location.protocol === 'file:') {
            console.log('Running from file:// protocol - attempting STL loading with enhanced error handling');
            showNotification('Attempting to load Heritage H2GP STL model...', 'info');
            
            // Try to load with enhanced error handling for local files
            loadHeritageModelWithEnhancedFallback(modelTitle, modelDescription);
            return;
        }
        
        console.log('Auto-loading Heritage H2GP model...');
        showNotification('Loading Heritage H2GP Car 2024...', 'info');
        
        // Try to load compressed version first, then fallback to original
        loadHeritageModelWithCompression(modelTitle, modelDescription);
    }, 2000); // Wait 2 seconds for scene initialization
}

// Enhanced fallback loading for local files (file:// protocol)
async function loadHeritageModelWithEnhancedFallback(title, description) {
    const compressedUrl = 'assets/models/heritage-h2gp-2024.stl.gz';
    const originalUrl = 'assets/models/heritage-h2gp-2024.stl';
    
    console.log('Attempting enhanced fallback loading for local files...');
    
    try {
        // First try to load the compressed version with enhanced error handling
        console.log('Trying compressed STL with enhanced fallback...');
        await loadCompressedSTLFromURL(compressedUrl, title, description);
        
        console.log('Heritage H2GP compressed model loaded successfully (local)');
        showNotification('Heritage H2GP Car 2024 loaded (compressed)!', 'success');
        
        // Save the model info for persistence
        saveCurrentSTLModel({
            url: compressedUrl,
            title: title,
            description: description,
            loadedFrom: 'permanent',
            modelId: 'heritage-h2gp-2024-compressed',
            compressed: true
        });
        
    } catch (compressedError) {
        console.log('Compressed model failed, trying original with enhanced fallback:', compressedError.message);
        
        try {
            // Fallback to original uncompressed version with enhanced error handling
            console.log('Trying original STL with enhanced fallback...');
            await loadSTLFromURL(originalUrl, title, description);
            
            console.log('Heritage H2GP original model loaded successfully (local)');
            showNotification('Heritage H2GP Car 2024 loaded!', 'success');
            
            // Save the model info for persistence
            saveCurrentSTLModel({
                url: originalUrl,
                title: title,
                description: description,
                loadedFrom: 'permanent',
                modelId: 'heritage-h2gp-2024'
            });
            
        } catch (originalError) {
            console.error('Both compressed and original models failed with enhanced fallback:', originalError);
            console.log('STL files exist but cannot be loaded due to browser security restrictions');
            showNotification('STL files found but cannot load due to browser security (use web server)', 'info');
            
            // Provide helpful information to the user
            setTimeout(() => {
                showNotification('Upload to InfinityFree to see the real STL model!', 'info');
            }, 3000);
        }
    }
}

// Load Heritage H2GP model with compression support
async function loadHeritageModelWithCompression(title, description) {
    const compressedUrl = 'assets/models/heritage-h2gp-2024.stl.gz';
    const originalUrl = 'assets/models/heritage-h2gp-2024.stl';
    
    try {
        // First try to load the compressed version
        console.log('Attempting to load compressed STL model...');
        await loadCompressedSTLFromURL(compressedUrl, title, description);
        
        console.log('Heritage H2GP compressed model loaded successfully');
        showNotification('Heritage H2GP Car 2024 loaded (compressed)!', 'success');
        
        // Save the model info for persistence
        saveCurrentSTLModel({
            url: compressedUrl,
            title: title,
            description: description,
            loadedFrom: 'permanent',
            modelId: 'heritage-h2gp-2024-compressed',
            compressed: true
        });
        
    } catch (compressedError) {
        console.log('Compressed model not available, trying original:', compressedError.message);
        
        try {
            // Fallback to original uncompressed version
            console.log('Attempting to load original STL model...');
            await loadSTLFromURL(originalUrl, title, description);
            
            console.log('Heritage H2GP original model loaded successfully');
            showNotification('Heritage H2GP Car 2024 loaded!', 'success');
            
            // Save the model info for persistence
            saveCurrentSTLModel({
                url: originalUrl,
                title: title,
                description: description,
                loadedFrom: 'permanent',
                modelId: 'heritage-h2gp-2024'
            });
            
        } catch (originalError) {
            console.error('Error loading both compressed and original Heritage H2GP model:', originalError);
            console.log('Heritage H2GP STL file not found, keeping default procedural model');
            showNotification('Heritage H2GP STL model not found, using default model', 'info');
        }
    }
}

// Load compressed STL from URL
async function loadCompressedSTLFromURL(url, title, description) {
    return new Promise(async (resolve, reject) => {
        try {
            // Check if pako library is available
            if (typeof pako === 'undefined') {
                throw new Error('Pako compression library not loaded');
            }
            
            console.log('Fetching compressed STL file:', url);
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const compressedData = await response.arrayBuffer();
            console.log('Compressed data size:', (compressedData.byteLength / (1024 * 1024)).toFixed(2) + ' MB');
            
            // Decompress the data
            console.log('Decompressing STL data...');
            const decompressed = pako.inflate(new Uint8Array(compressedData));
            console.log('Decompressed data size:', (decompressed.byteLength / (1024 * 1024)).toFixed(2) + ' MB');
            
            // Load with STLLoader
            const loader = new THREE.STLLoader();
            const geometry = loader.parse(decompressed.buffer);
            
            // Clear existing model
            if (carModel) {
                scene.remove(carModel);
                originalPositions = [];
            }
            
            // Create material for the STL model
            const material = new THREE.MeshPhongMaterial({
                color: 0x2af0ff,
                shininess: 100,
                transparent: true,
                opacity: 0.9
            });
            
            // Create mesh
            carModel = new THREE.Mesh(geometry, material);
            carModel.castShadow = true;
            carModel.receiveShadow = true;
            
            // Center and scale the model
            const box = new THREE.Box3().setFromObject(carModel);
            const center = box.getCenter(new THREE.Vector3());
            const size = box.getSize(new THREE.Vector3());
            
            // Center the model horizontally and position on road
            carModel.position.sub(center);
            
            // Scale the model to fit nicely in the viewer
            const maxDimension = Math.max(size.x, size.y, size.z);
            const scale = 3 / maxDimension; // Scale to fit in a 3-unit space
            carModel.scale.setScalar(scale);
            
            // Position the model in the center of the road
            carModel.position.set(0, 0.5, 0);
            
            // Store original position for explode effect
            originalPositions = [{
                object: carModel,
                position: carModel.position.clone()
            }];
            
            // Add to scene
            scene.add(carModel);
            
            // Update flags
            isSTLModel = true;
            isWireframe = false;
            isExploded = false;
            
            // Reset camera position for better view
            camera.position.set(5, 3, 5);
            controls.reset();
            
            console.log('Compressed STL model loaded successfully:', title);
            resolve();
            
        } catch (error) {
            console.error('Error loading compressed STL:', error);
            reject(error);
        }
    });
}

// STL Model Persistence Functions
function saveCurrentSTLModel(modelInfo) {
    try {
        localStorage.setItem('h2gp-current-stl-model', JSON.stringify(modelInfo));
        console.log('STL model info saved to localStorage:', modelInfo);
    } catch (error) {
        console.error('Error saving STL model info:', error);
    }
}

function loadLastUploadedSTL() {
    try {
        const savedModelInfo = localStorage.getItem('h2gp-current-stl-model');
        if (savedModelInfo) {
            const modelInfo = JSON.parse(savedModelInfo);
            console.log('Found saved STL model info:', modelInfo);
            
            // Wait a bit for the scene to be fully initialized
            setTimeout(() => {
                if (modelInfo.url && modelInfo.loadedFrom === 'cloud') {
                    console.log('Loading saved STL model from cloud:', modelInfo.url);
                    showNotification(`Loading your saved STL model: ${modelInfo.title}`, 'info');
                    loadSTLFromURL(modelInfo.url, modelInfo.title, modelInfo.description);
                }
            }, 2000); // Wait 2 seconds after initial model load
        } else {
            console.log('No saved STL model found');
        }
    } catch (error) {
        console.error('Error loading saved STL model:', error);
    }
}

// Update keyboard navigation to include STL modal
document.addEventListener('keydown', (e) => {
    const imageViewer = document.getElementById('imageViewerModal');
    const photoModal = document.getElementById('photoModal');
    const stlModal = document.getElementById('stlModal');
    
    if (imageViewer.style.display === 'block') {
        switch(e.key) {
            case 'Escape':
                closeImageViewer();
                break;
            case 'ArrowLeft':
                previousImage();
                break;
            case 'ArrowRight':
                nextImage();
                break;
        }
    }
    
    if (photoModal.style.display === 'block' && e.key === 'Escape') {
        closePhotoModal();
    }
    
    if (stlModal.style.display === 'block' && e.key === 'Escape') {
        closeSTLModal();
    }
});

// Update modal click-outside-to-close functionality
window.addEventListener('click', (e) => {
    const photoModal = document.getElementById('photoModal');
    const imageViewerModal = document.getElementById('imageViewerModal');
    const stlModal = document.getElementById('stlModal');
    
    if (e.target === photoModal) {
        closePhotoModal();
    }
    
    if (e.target === imageViewerModal) {
        closeImageViewer();
    }
    
    if (e.target === stlModal) {
        closeSTLModal();
    }
});

// Video switching functionality
let currentVideoIndex = 0;
const videoIds = ['hero-video-1', 'hero-video-2'];

function switchVideo() {
    const currentVideo = document.getElementById(videoIds[currentVideoIndex]);
    const nextVideoIndex = (currentVideoIndex + 1) % videoIds.length;
    const nextVideo = document.getElementById(videoIds[nextVideoIndex]);
    
    if (currentVideo && nextVideo) {
        // Fade out current video
        currentVideo.classList.remove('active');
        
        // Fade in next video after a short delay
        setTimeout(() => {
            nextVideo.classList.add('active');
            currentVideoIndex = nextVideoIndex;
        }, 400);
        
        console.log(`Switched to video ${nextVideoIndex + 1}`);
        showNotification(`Switched to video ${nextVideoIndex + 1}`, 'success');
    }
}

// Auto-switch videos every 30 seconds
setInterval(() => {
    switchVideo();
}, 30000);

// Music Player Functions
let musicPlayer = null;
let isPlaying = false;
let currentVolume = 30;

function toggleMusic() {
    const playPauseBtn = document.getElementById('playPauseBtn');
    const musicStatus = document.getElementById('musicStatus');
    const musicIcon = playPauseBtn.querySelector('.music-icon');
    const iframe = document.getElementById('backgroundMusic');
    
    if (!isPlaying) {
        // Start playing
        iframe.src = iframe.src.replace('autoplay=0', 'autoplay=1');
        isPlaying = true;
        musicIcon.textContent = '⏸️';
        musicStatus.textContent = 'Playing';
        playPauseBtn.classList.add('playing');
        showNotification('Music started playing', 'success');
        console.log('Music started playing');
    } else {
        // Pause/stop playing
        iframe.src = iframe.src.replace('autoplay=1', 'autoplay=0');
        isPlaying = false;
        musicIcon.textContent = '🎵';
        musicStatus.textContent = 'Paused';
        playPauseBtn.classList.remove('playing');
        showNotification('Music paused', 'info');
        console.log('Music paused');
    }
}

function toggleVolume() {
    const volumeSlider = document.getElementById('volumeSlider');
    const isVisible = volumeSlider.style.display === 'block';
    
    if (isVisible) {
        volumeSlider.style.display = 'none';
    } else {
        volumeSlider.style.display = 'block';
        // Auto-hide after 5 seconds
        setTimeout(() => {
            volumeSlider.style.display = 'none';
        }, 5000);
    }
}

function setVolume(value) {
    currentVolume = value;
    const volumeIcon = document.getElementById('volumeIcon');
    
    // Update volume icon based on level
    if (value == 0) {
        volumeIcon.textContent = '🔇';
    } else if (value < 30) {
        volumeIcon.textContent = '🔉';
    } else {
        volumeIcon.textContent = '🔊';
    }
    
    // Note: YouTube iframe doesn't allow direct volume control from external JavaScript
    // This is a limitation of YouTube's embed API for security reasons
    console.log('Volume set to:', value + '%');
    showNotification(`Volume: ${value}%`, 'info');
}


function initMusicPlayer() {
    const musicPlayer = document.getElementById('musicPlayer');
    const volumeSlider = document.getElementById('volumeSlider');
    
    // Set initial volume
    const volumeRange = document.getElementById('volumeRange');
    if (volumeRange) {
        volumeRange.value = currentVolume;
        setVolume(currentVolume);
    }
    
    // Hide volume slider initially
    if (volumeSlider) {
        volumeSlider.style.display = 'none';
    }
    
    // Add hover effects for music player
    if (musicPlayer) {
        musicPlayer.addEventListener('mouseenter', () => {
            musicPlayer.classList.add('hover');
        });
        
        musicPlayer.addEventListener('mouseleave', () => {
            musicPlayer.classList.remove('hover');
            // Hide volume slider when leaving music player area
            setTimeout(() => {
                if (volumeSlider) {
                    volumeSlider.style.display = 'none';
                }
            }, 1000);
        });
    }
    
    console.log('Music player initialized');
}

// Add keyboard shortcuts for music control
document.addEventListener('keydown', (e) => {
    // Only trigger if no modal is open and not typing in an input
    const isModalOpen = document.querySelector('.modal[style*="display: block"]') || 
                       document.querySelector('.stl-modal[style*="display: block"]');
    const isTyping = document.activeElement.tagName === 'INPUT' || 
                    document.activeElement.tagName === 'TEXTAREA';
    
    if (!isModalOpen && !isTyping) {
        switch(e.key.toLowerCase()) {
            case 'm':
                e.preventDefault();
                toggleMusic();
                break;
            case 'v':
                e.preventDefault();
                toggleVolume();
                break;
        }
    }
});
