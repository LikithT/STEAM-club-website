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
    initPhotoGallery();
    addDefaultPhotos();
    loadPhotos();
    initModelViewer();
    
    // Load 3D model automatically when page loads
    setTimeout(() => {
        loadModel();
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
    
    // Main street surface
    const streetGeometry = new THREE.PlaneGeometry(16, 8);
    const streetMaterial = new THREE.MeshLambertMaterial({ 
        color: 0x333333,
        transparent: true,
        opacity: 0.9
    });
    const street = new THREE.Mesh(streetGeometry, streetMaterial);
    street.rotation.x = -Math.PI / 2;
    street.receiveShadow = true;
    streetGroup.add(street);
    
    // Street lane markings (Japanese style)
    const laneGeometry = new THREE.PlaneGeometry(14, 0.15);
    const laneMaterial = new THREE.MeshBasicMaterial({ 
        color: 0xffffff,
        transparent: true,
        opacity: 0.9
    });
    
    // Center line (dashed style)
    for (let i = -6; i <= 6; i += 2) {
        const dashGeometry = new THREE.PlaneGeometry(1.5, 0.15);
        const centerDash = new THREE.Mesh(dashGeometry, laneMaterial);
        centerDash.rotation.x = -Math.PI / 2;
        centerDash.position.set(i, 0.01, 0);
        streetGroup.add(centerDash);
    }
    
    // Side lines
    const leftLine = new THREE.Mesh(laneGeometry, laneMaterial);
    leftLine.rotation.x = -Math.PI / 2;
    leftLine.position.set(0, 0.01, -3.5);
    streetGroup.add(leftLine);
    
    const rightLine = new THREE.Mesh(laneGeometry, laneMaterial);
    rightLine.rotation.x = -Math.PI / 2;
    rightLine.position.set(0, 0.01, 3.5);
    streetGroup.add(rightLine);
    
    // Sidewalks
    const sidewalkGeometry = new THREE.PlaneGeometry(16, 1.5);
    const sidewalkMaterial = new THREE.MeshLambertMaterial({ color: 0x888888 });
    
    const leftSidewalk = new THREE.Mesh(sidewalkGeometry, sidewalkMaterial);
    leftSidewalk.rotation.x = -Math.PI / 2;
    leftSidewalk.position.set(0, 0.02, -4.75);
    leftSidewalk.receiveShadow = true;
    streetGroup.add(leftSidewalk);
    
    const rightSidewalk = new THREE.Mesh(sidewalkGeometry, sidewalkMaterial);
    rightSidewalk.rotation.x = -Math.PI / 2;
    rightSidewalk.position.set(0, 0.02, 4.75);
    rightSidewalk.receiveShadow = true;
    streetGroup.add(rightSidewalk);
    
    // Japanese-style buildings
    const buildingPositions = [
        { x: -6, z: -7, width: 3, height: 4, depth: 2 },
        { x: -2, z: -7, width: 2.5, height: 3, depth: 2 },
        { x: 2, z: -7, width: 3.5, height: 5, depth: 2 },
        { x: 6, z: -7, width: 2, height: 3.5, depth: 2 },
        { x: -6, z: 7, width: 2.5, height: 3.5, depth: 2 },
        { x: -2, z: 7, width: 3, height: 4.5, depth: 2 },
        { x: 2, z: 7, width: 2, height: 3, depth: 2 },
        { x: 6, z: 7, width: 3.5, height: 4, depth: 2 }
    ];
    
    buildingPositions.forEach(pos => {
        // Building base
        const buildingGeometry = new THREE.BoxGeometry(pos.width, pos.height, pos.depth);
        const buildingMaterial = new THREE.MeshLambertMaterial({ 
            color: new THREE.Color().setHSL(0.1, 0.2, 0.4 + Math.random() * 0.3)
        });
        const building = new THREE.Mesh(buildingGeometry, buildingMaterial);
        building.position.set(pos.x, pos.height / 2, pos.z);
        building.castShadow = true;
        building.receiveShadow = true;
        streetGroup.add(building);
        
        // Building roof (traditional Japanese style)
        const roofGeometry = new THREE.BoxGeometry(pos.width + 0.3, 0.2, pos.depth + 0.3);
        const roofMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
        const roof = new THREE.Mesh(roofGeometry, roofMaterial);
        roof.position.set(pos.x, pos.height + 0.1, pos.z);
        roof.castShadow = true;
        streetGroup.add(roof);
        
        // Windows
        const windowGeometry = new THREE.PlaneGeometry(0.3, 0.4);
        const windowMaterial = new THREE.MeshBasicMaterial({ 
            color: 0xffffaa,
            transparent: true,
            opacity: 0.8
        });
        
        for (let i = 0; i < 2; i++) {
            const window = new THREE.Mesh(windowGeometry, windowMaterial);
            window.position.set(
                pos.x + (i - 0.5) * 0.8,
                pos.height * 0.6,
                pos.z + (pos.depth / 2) + 0.01
            );
            streetGroup.add(window);
        }
    });
    
    // Street lamps (Japanese style)
    const lampPositions = [
        { x: -4, z: -4.5 },
        { x: 0, z: -4.5 },
        { x: 4, z: -4.5 },
        { x: -4, z: 4.5 },
        { x: 0, z: 4.5 },
        { x: 4, z: 4.5 }
    ];
    
    lampPositions.forEach(pos => {
        // Lamp post
        const postGeometry = new THREE.CylinderGeometry(0.05, 0.05, 2.5);
        const postMaterial = new THREE.MeshLambertMaterial({ color: 0x444444 });
        const post = new THREE.Mesh(postGeometry, postMaterial);
        post.position.set(pos.x, 1.25, pos.z);
        post.castShadow = true;
        streetGroup.add(post);
        
        // Lamp head
        const lampGeometry = new THREE.SphereGeometry(0.15, 8, 6);
        const lampMaterial = new THREE.MeshBasicMaterial({ 
            color: 0xffffcc,
            transparent: true,
            opacity: 0.8
        });
        const lamp = new THREE.Mesh(lampGeometry, lampMaterial);
        lamp.position.set(pos.x, 2.6, pos.z);
        streetGroup.add(lamp);
        
        // Lamp glow
        const glowGeometry = new THREE.SphereGeometry(0.3, 8, 6);
        const glowMaterial = new THREE.MeshBasicMaterial({ 
            color: 0xffffaa,
            transparent: true,
            opacity: 0.2
        });
        const glow = new THREE.Mesh(glowGeometry, glowMaterial);
        glow.position.set(pos.x, 2.6, pos.z);
        streetGroup.add(glow);
    });
    
    // Japanese vending machines
    const vendingPositions = [
        { x: -7, z: -5.5, rotation: Math.PI / 2 },
        { x: 7, z: 5.5, rotation: -Math.PI / 2 }
    ];
    
    vendingPositions.forEach(pos => {
        const vendingGeometry = new THREE.BoxGeometry(0.8, 1.8, 0.6);
        const vendingMaterial = new THREE.MeshLambertMaterial({ color: 0xff4444 });
        const vending = new THREE.Mesh(vendingGeometry, vendingMaterial);
        vending.position.set(pos.x, 0.9, pos.z);
        vending.rotation.y = pos.rotation;
        vending.castShadow = true;
        vending.receiveShadow = true;
        streetGroup.add(vending);
        
        // Vending machine screen
        const screenGeometry = new THREE.PlaneGeometry(0.5, 0.7);
        const screenMaterial = new THREE.MeshBasicMaterial({ 
            color: 0x0066ff,
            transparent: true,
            opacity: 0.8
        });
        const screen = new THREE.Mesh(screenGeometry, screenMaterial);
        screen.position.set(
            pos.x + Math.sin(pos.rotation) * 0.31,
            1.2,
            pos.z + Math.cos(pos.rotation) * 0.31
        );
        screen.rotation.y = pos.rotation;
        streetGroup.add(screen);
    });
    
    // Ground around the street
    const groundGeometry = new THREE.PlaneGeometry(25, 25);
    const groundMaterial = new THREE.MeshLambertMaterial({ color: 0x2a4a2a });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.05;
    ground.receiveShadow = true;
    streetGroup.add(ground);
    
    // Add some Japanese-style decorative elements
    // Cherry blossom trees (simplified)
    const treePositions = [
        { x: -8, z: -2 },
        { x: 8, z: 2 },
        { x: -8, z: 2 },
        { x: 8, z: -2 }
    ];
    
    treePositions.forEach(pos => {
        // Tree trunk
        const trunkGeometry = new THREE.CylinderGeometry(0.1, 0.15, 2);
        const trunkMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
        const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
        trunk.position.set(pos.x, 1, pos.z);
        trunk.castShadow = true;
        streetGroup.add(trunk);
        
        // Tree foliage
        const foliageGeometry = new THREE.SphereGeometry(0.8, 8, 6);
        const foliageMaterial = new THREE.MeshLambertMaterial({ 
            color: 0xffb6c1,
            transparent: true,
            opacity: 0.8
        });
        const foliage = new THREE.Mesh(foliageGeometry, foliageMaterial);
        foliage.position.set(pos.x, 2.5, pos.z);
        foliage.castShadow = true;
        streetGroup.add(foliage);
    });
    
    scene.add(streetGroup);
}

function animate() {
    requestAnimationFrame(animate);
    
    if (controls) {
        controls.update();
    }
    
    // Rotate the car slightly for visual appeal (but not STL models)
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

// Keyboard navigation for image viewer and model viewer
document.addEventListener('keydown', (e) => {
    const imageViewer = document.getElementById('imageViewerModal');
    const photoModal = document.getElementById('photoModal');
    
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
});

// Close modals when clicking outside
window.addEventListener('click', (e) => {
    const photoModal = document.getElementById('photoModal');
    const imageViewerModal = document.getElementById('imageViewerModal');
    const modelViewerContainer = document.querySelector('.model-viewer-container');
    
    if (e.target === photoModal) {
        closePhotoModal();
    }
    
    if (e.target === imageViewerModal) {
        closeImageViewer();
    }
    
    if (e.target === modelViewerContainer && isModelViewerVisible) {
        toggleModelViewer();
    }
});

// Reduced motion support
if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    // Reduce GSAP animations
    gsap.globalTimeline.timeScale(0.1);
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

// STL Model Functions
function openSTLModal() {
    document.getElementById('stlModal').style.display = 'block';
    document.body.style.overflow = 'hidden';
    initSTLUpload();
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
    
    showNotification('Loading STL model...', 'info');
    
    // Create FileReader to read the STL file
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
            carModel.position.set(0, 0.5, 0); // X=0 (road center), Y=0.5 (above road), Z=0 (road center)
            
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
            closeSTLModal();
            
            console.log('STL model loaded:', title);
            
        } catch (error) {
            console.error('Error loading STL file:', error);
            showNotification('Error loading STL file. Please check the file format.', 'error');
        }
    };
    
    reader.onerror = function() {
        showNotification('Error reading STL file', 'error');
    };
    
    reader.readAsArrayBuffer(currentSTLFile);
}

function loadDefaultModel() {
    // Clear existing STL model if present
    if (carModel) {
        scene.remove(carModel);
        originalPositions = [];
    }
    
    // Reset flags
    isSTLModel = false;
    isWireframe = false;
    isExploded = false;
    
    // Load the default procedural model
    createH2GPCar();
    
    // Reset camera
    camera.position.set(5, 3, 5);
    controls.reset();
    
    showNotification('Default Heritage H2GP model loaded', 'success');
    console.log('Default model loaded');
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
