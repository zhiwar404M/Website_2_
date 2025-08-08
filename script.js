// CineVerse - Advanced 3D Streaming Platform JavaScript

class CineVerse3D {
    constructor() {
        this.init();
        this.setupEventListeners();
        this.createParticleSystem();
        this.setupParallaxEffect();
        this.initializeAnimations();
    }

    init() {
        // Initialize the platform
        this.navbar = document.querySelector('.navbar');
        this.hero = document.querySelector('.hero');
        this.movieCards = document.querySelectorAll('.movie-card');
        this.categoryCards = document.querySelectorAll('.category-card');
        this.featuredCards = document.querySelectorAll('.featured-card');
        this.scrollPosition = 0;
        this.isScrolling = false;
        
        console.log('🎬 CineVerse 3D Platform Initialized');
    }

    setupEventListeners() {
        // Scroll effects
        window.addEventListener('scroll', () => this.handleScroll());
        
        // Mouse tracking for 3D effects
        document.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        
        // Movie card interactions
        this.movieCards.forEach(card => {
            card.addEventListener('mouseenter', (e) => this.handleCardHover(e));
            card.addEventListener('mousemove', (e) => this.handleCardMouseMove(e));
            card.addEventListener('mouseleave', (e) => this.handleCardLeave(e));
        });

        // Category card interactions
        this.categoryCards.forEach(card => {
            card.addEventListener('mouseenter', (e) => this.handleCategoryHover(e));
            card.addEventListener('mouseleave', (e) => this.handleCategoryLeave(e));
        });

        // Featured card interactions
        this.featuredCards.forEach(card => {
            card.addEventListener('mouseenter', (e) => this.handleFeaturedHover(e));
            card.addEventListener('mouseleave', (e) => this.handleFeaturedLeave(e));
        });

        // Navigation interactions
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('mouseenter', (e) => this.handleNavHover(e));
            link.addEventListener('mouseleave', (e) => this.handleNavLeave(e));
        });

        // Button interactions
        const buttons = document.querySelectorAll('.btn, .watch-btn, .play-btn');
        buttons.forEach(btn => {
            btn.addEventListener('click', (e) => this.handleButtonClick(e));
        });

        // Window resize
        window.addEventListener('resize', () => this.handleResize());
    }

    handleScroll() {
        this.scrollPosition = window.pageYOffset;
        
        // Navbar scroll effect
        if (this.scrollPosition > 100) {
            this.navbar.style.background = 'rgba(15, 15, 35, 0.98)';
            this.navbar.style.backdropFilter = 'blur(25px)';
            this.navbar.style.borderBottom = '1px solid rgba(229, 9, 20, 0.3)';
        } else {
            this.navbar.style.background = 'rgba(15, 15, 35, 0.95)';
            this.navbar.style.backdropFilter = 'blur(20px)';
            this.navbar.style.borderBottom = '1px solid rgba(255, 255, 255, 0.1)';
        }

        // Parallax effect for floating posters
        this.updateParallax();
        
        // Update particle system
        this.updateParticles();

        // Reveal animations for sections
        this.handleScrollAnimations();
    }

    handleMouseMove(e) {
        const mouseX = e.clientX / window.innerWidth;
        const mouseY = e.clientY / window.innerHeight;

        // Hero 3D effect
        const heroCard = document.querySelector('.hero-movie-card');
        if (heroCard) {
            const rotateY = (mouseX - 0.5) * 30;
            const rotateX = (mouseY - 0.5) * -30;
            heroCard.style.transform = `rotateY(${rotateY}deg) rotateX(${rotateX}deg)`;
        }

        // Update floating elements
        const floatingElements = document.querySelectorAll('.floating-poster');
        floatingElements.forEach((element, index) => {
            const speed = (index + 1) * 0.5;
            const x = (mouseX - 0.5) * speed * 20;
            const y = (mouseY - 0.5) * speed * 20;
            element.style.transform += ` translate(${x}px, ${y}px)`;
        });
    }

    handleCardHover(e) {
        const card = e.currentTarget;
        const cardInner = card.querySelector('.card-inner');
        
        // Add glow effect
        card.style.boxShadow = '0 25px 60px rgba(229, 9, 20, 0.4)';
        card.style.transform = 'translateY(-10px) scale(1.02)';
        
        // Create ripple effect
        this.createRippleEffect(card, e);
    }

    handleCardMouseMove(e) {
        const card = e.currentTarget;
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        const rotateX = (y - centerY) / 10;
        const rotateY = (centerX - x) / 10;
        
        card.style.transform = `translateY(-10px) scale(1.02) perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    }

    handleCardLeave(e) {
        const card = e.currentTarget;
        card.style.boxShadow = '';
        card.style.transform = '';
    }

    handleCategoryHover(e) {
        const card = e.currentTarget;
        const icon = card.querySelector('.category-icon');
        
        // Enhanced hover effect
        card.style.transform = 'translateY(-15px) scale(1.05)';
        card.style.boxShadow = '0 30px 70px rgba(229, 9, 20, 0.3)';
        
        // Icon animation
        if (icon) {
            icon.style.transform = 'scale(1.3) rotateY(360deg)';
        }
        
        // Background animation
        this.animateCardBackground(card);
    }

    handleCategoryLeave(e) {
        const card = e.currentTarget;
        const icon = card.querySelector('.category-icon');
        
        card.style.transform = '';
        card.style.boxShadow = '';
        
        if (icon) {
            icon.style.transform = '';
        }
    }

    handleFeaturedHover(e) {
        const card = e.currentTarget;
        
        // 3D rotation effect
        card.style.transform = 'scale(1.08) rotateY(8deg) rotateX(5deg)';
        card.style.boxShadow = '0 25px 60px rgba(229, 9, 20, 0.4)';
        
        // Animate overlay
        const overlay = card.querySelector('.card-overlay');
        if (overlay) {
            overlay.style.transform = 'translateY(0)';
            overlay.style.opacity = '1';
        }
    }

    handleFeaturedLeave(e) {
        const card = e.currentTarget;
        
        card.style.transform = '';
        card.style.boxShadow = '';
        
        const overlay = card.querySelector('.card-overlay');
        if (overlay) {
            overlay.style.transform = 'translateY(100%)';
            overlay.style.opacity = '0';
        }
    }

    handleNavHover(e) {
        const link = e.currentTarget;
        
        // Create magnetic effect
        link.style.transform = 'translateY(-3px) scale(1.05)';
        link.style.boxShadow = '0 15px 30px rgba(229, 9, 20, 0.4)';
        
        // Add pulse animation
        link.style.animation = 'pulse 1s ease-in-out infinite';
    }

    handleNavLeave(e) {
        const link = e.currentTarget;
        
        link.style.transform = '';
        link.style.boxShadow = '';
        link.style.animation = '';
    }

    handleButtonClick(e) {
        const button = e.currentTarget;
        
        // Click ripple effect
        this.createClickRipple(button, e);
        
        // Button feedback
        button.style.transform = 'scale(0.95)';
        setTimeout(() => {
            button.style.transform = '';
        }, 150);
        
        // Play sound effect (if audio is enabled)
        this.playClickSound();
    }

    createRippleEffect(element, event) {
        const ripple = document.createElement('div');
        const rect = element.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = event.clientX - rect.left - size / 2;
        const y = event.clientY - rect.top - size / 2;
        
        ripple.style.cssText = `
            position: absolute;
            width: ${size}px;
            height: ${size}px;
            left: ${x}px;
            top: ${y}px;
            background: radial-gradient(circle, rgba(229, 9, 20, 0.3) 0%, transparent 70%);
            border-radius: 50%;
            pointer-events: none;
            animation: ripple 0.6s ease-out;
            z-index: 10;
        `;
        
        element.style.position = 'relative';
        element.appendChild(ripple);
        
        setTimeout(() => {
            ripple.remove();
        }, 600);
    }

    createClickRipple(element, event) {
        const ripple = document.createElement('div');
        const rect = element.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height) * 2;
        const x = event.clientX - rect.left - size / 2;
        const y = event.clientY - rect.top - size / 2;
        
        ripple.style.cssText = `
            position: absolute;
            width: ${size}px;
            height: ${size}px;
            left: ${x}px;
            top: ${y}px;
            background: radial-gradient(circle, rgba(255, 255, 255, 0.3) 0%, transparent 70%);
            border-radius: 50%;
            pointer-events: none;
            animation: clickRipple 0.4s ease-out;
            z-index: 10;
        `;
        
        element.style.position = 'relative';
        element.appendChild(ripple);
        
        setTimeout(() => {
            ripple.remove();
        }, 400);
    }

    animateCardBackground(card) {
        const bg = card.querySelector('.category-bg') || document.createElement('div');
        bg.className = 'category-bg';
        
        bg.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: linear-gradient(135deg, rgba(229, 9, 20, 0.1) 0%, rgba(244, 6, 18, 0.05) 100%);
            opacity: 0;
            transition: opacity 0.3s ease;
            z-index: -1;
        `;
        
        if (!card.querySelector('.category-bg')) {
            card.appendChild(bg);
        }
        
        setTimeout(() => {
            bg.style.opacity = '1';
        }, 50);
    }

    createParticleSystem() {
        const particleContainer = document.createElement('div');
        particleContainer.className = 'particle-system';
        particleContainer.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: -1;
            overflow: hidden;
        `;
        
        document.body.appendChild(particleContainer);
        
        // Create floating particles
        for (let i = 0; i < 50; i++) {
            this.createParticle(particleContainer);
        }
        
        this.particleContainer = particleContainer;
    }

    createParticle(container) {
        const particle = document.createElement('div');
        const size = Math.random() * 4 + 1;
        const x = Math.random() * window.innerWidth;
        const y = Math.random() * window.innerHeight;
        const duration = Math.random() * 20 + 10;
        const delay = Math.random() * 5;
        
        particle.style.cssText = `
            position: absolute;
            width: ${size}px;
            height: ${size}px;
            left: ${x}px;
            top: ${y}px;
            background: linear-gradient(45deg, #e50914, #f40612);
            border-radius: 50%;
            opacity: ${Math.random() * 0.5 + 0.2};
            animation: floatParticle ${duration}s ease-in-out infinite;
            animation-delay: ${delay}s;
            box-shadow: 0 0 ${size * 2}px rgba(229, 9, 20, 0.5);
        `;
        
        container.appendChild(particle);
        
        // Remove and recreate particle after animation
        setTimeout(() => {
            particle.remove();
            this.createParticle(container);
        }, (duration + delay) * 1000);
    }

    setupParallaxEffect() {
        this.parallaxElements = document.querySelectorAll('.floating-poster, .hero-particles');
    }

    updateParallax() {
        const scrolled = this.scrollPosition;
        
        this.parallaxElements.forEach((element, index) => {
            const speed = (index + 1) * 0.1;
            const yPos = -(scrolled * speed);
            element.style.transform += ` translateY(${yPos}px)`;
        });
    }

    updateParticles() {
        // Update particle positions based on scroll
        if (this.particleContainer) {
            const particles = this.particleContainer.querySelectorAll('div');
            particles.forEach((particle, index) => {
                const speed = (index % 3 + 1) * 0.05;
                const currentTransform = particle.style.transform || '';
                const yOffset = this.scrollPosition * speed;
                particle.style.transform = currentTransform + ` translateY(${yOffset}px)`;
            });
        }
    }

    handleScrollAnimations() {
        const sections = document.querySelectorAll('section');
        const triggerBottom = window.innerHeight * 0.8;
        
        sections.forEach(section => {
            const sectionTop = section.getBoundingClientRect().top;
            
            if (sectionTop < triggerBottom && sectionTop > -section.offsetHeight) {
                section.style.opacity = '1';
                section.style.transform = 'translateY(0)';
            }
        });
    }

    initializeAnimations() {
        // Add custom CSS animations
        const style = document.createElement('style');
        style.textContent = `
            @keyframes ripple {
                0% {
                    transform: scale(0);
                    opacity: 1;
                }
                100% {
                    transform: scale(1);
                    opacity: 0;
                }
            }
            
            @keyframes clickRipple {
                0% {
                    transform: scale(0);
                    opacity: 0.5;
                }
                100% {
                    transform: scale(1);
                    opacity: 0;
                }
            }
            
            @keyframes floatParticle {
                0%, 100% {
                    transform: translateY(0) rotate(0deg);
                    opacity: 0;
                }
                10%, 90% {
                    opacity: 1;
                }
                50% {
                    transform: translateY(-100px) rotate(180deg);
                }
            }
            
            @keyframes pulse {
                0%, 100% {
                    opacity: 1;
                }
                50% {
                    opacity: 0.7;
                }
            }
            
            .hero-visual {
                opacity: 0;
                transform: translateX(100px);
                animation: slideInRight 1s ease-out forwards;
            }
            
            .hero-text {
                opacity: 0;
                transform: translateX(-100px);
                animation: slideInLeft 1s ease-out forwards;
            }
            
            section {
                opacity: 0;
                transform: translateY(50px);
                transition: all 0.6s ease;
            }
            
            .movie-card {
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            }
            
            .category-card {
                transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
            }
        `;
        document.head.appendChild(style);
        
        // Initialize section animations
        setTimeout(() => {
            document.querySelector('.hero').style.opacity = '1';
            document.querySelector('.hero').style.transform = 'translateY(0)';
        }, 100);
    }

    playClickSound() {
        // Optional: Add subtle click sound
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
            gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.1);
        } catch (e) {
            // Audio not supported or blocked
        }
    }

    handleResize() {
        // Reinitialize particle system on resize
        if (this.particleContainer) {
            this.particleContainer.remove();
            this.createParticleSystem();
        }
    }

    // Advanced 3D tilt effect for movie cards
    addTiltEffect() {
        this.movieCards.forEach(card => {
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                
                const rotateX = (y - centerY) / 4;
                const rotateY = (centerX - x) / 4;
                
                card.style.transform = `
                    perspective(1000px) 
                    rotateX(${rotateX}deg) 
                    rotateY(${rotateY}deg) 
                    scale3d(1.05, 1.05, 1.05)
                `;
            });
            
            card.addEventListener('mouseleave', () => {
                card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
            });
        });
    }

    // Magnetic cursor effect
    addMagneticEffect() {
        const magneticElements = document.querySelectorAll('.btn, .nav-link, .play-btn');
        
        magneticElements.forEach(element => {
            element.addEventListener('mousemove', (e) => {
                const rect = element.getBoundingClientRect();
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;
                
                element.style.transform = `translate(${x * 0.1}px, ${y * 0.1}px)`;
            });
            
            element.addEventListener('mouseleave', () => {
                element.style.transform = '';
            });
        });
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const app = new CineVerse3D();
    
    // Add additional advanced effects
    setTimeout(() => {
        app.addTiltEffect();
        app.addMagneticEffect();
    }, 1000);
    
    // Console welcome message
    console.log(`
    🎬 Welcome to CineVerse 3D
    ========================
    Advanced 3D Streaming Platform
    Featuring immersive visual effects
    and interactive 3D animations
    ========================
    `);
});

// Export for potential module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CineVerse3D;
}