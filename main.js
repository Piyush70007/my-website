// Main JavaScript file

// Mobile menu toggle functionality
document.addEventListener('DOMContentLoaded', function() {
    const mobileMenuButton = document.querySelector('.mobile-menu');
    const navLinks = document.querySelector('.nav-links');

    AOS.init({
        duration: 1000, // Animation duration in milliseconds
        once: true, // Whether animation should happen only once - while scrolling down
    });
    console.log('AOS initialized');
    
    if (mobileMenuButton && navLinks) {
        mobileMenuButton.addEventListener('click', function() {
            navLinks.classList.toggle('active');
            mobileMenuButton.classList.toggle('active');
        });
    }
    
    // Add scroll animations
    const scrollAnimationElements = document.querySelectorAll('.scroll-animation');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate');
            }
        });
    }, { threshold: 0.1 });
    
    scrollAnimationElements.forEach(element => {
        observer.observe(element);
    });
    
    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 80,
                    behavior: 'smooth'
                });
                
                // Close mobile menu if open
                if (navLinks.classList.contains('active')) {
                    navLinks.classList.remove('active');
                    mobileMenuButton.classList.remove('active');
                }
            }
        });
    });
    
    // Form submission handling
    const contactForm = document.querySelector('.contact-form');
    
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form data
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const subject = document.getElementById('subject').value;
            const message = document.getElementById('message').value;
            
            // Validate form data
            if (!name || !email || !subject || !message) {
                alert('Please fill in all fields');
                return;
            }
            
            // Here you would typically send the form data to a server
            // For demo purposes, we'll just show a success message
            const formBtn = contactForm.querySelector('button');
            const originalBtnText = formBtn.textContent;
            
            formBtn.textContent = 'Sending...';
            formBtn.disabled = true;
            
            // Simulate API call
            setTimeout(() => {
                alert('Your message has been sent successfully!');
                contactForm.reset();
                formBtn.textContent = originalBtnText;
                formBtn.disabled = false;
            }, 1500);
        });
    }
    
    // Add active class to nav links based on scroll position
    const sections = document.querySelectorAll('section[id]');
    
    function highlightActiveNavLink() {
        const scrollPosition = window.scrollY;
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 100;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');
            const navLink = document.querySelector(`.nav-links a[href="#${sectionId}"]`);
            
            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                navLink?.classList.add('active');
            } else {
                navLink?.classList.remove('active');
            }
        });
    }
    
    window.addEventListener('scroll', highlightActiveNavLink);
    
    // Initialize animation for elements that are already in viewport on page load
    setTimeout(() => {
        highlightActiveNavLink();
    }, 100);
    
    // Add CSS for mobile menu
    const style = document.createElement('style');
    style.textContent = `
        @media (max-width: 768px) {
            .nav-links {
                position: fixed;
                top: 80px;
                right: -100%;
                width: 70%;
                height: calc(100vh - 80px);
                background-color: rgba(18, 18, 18, 0.95);
                flex-direction: column;
                align-items: center;
                justify-content: flex-start;
                padding-top: 2rem;
                transition: right 0.3s ease;
                backdrop-filter: blur(5px);
                z-index: 999;
            }
            
            .nav-links.active {
                right: 0;
            }
            
            .nav-links li {
                margin: 1.5rem 0;
            }
            
            .mobile-menu {
                z-index: 1000;
            }
            
            .mobile-menu.active svg {
                transform: rotate(90deg);
            }
            
            .mobile-menu svg {
                transition: transform 0.3s ease;
            }
        }
        
        .nav-links a.active {
            color: var(--primary-color);
        }
        
        .nav-links a.active::after {
            width: 100%;
        }
    `;
    document.head.appendChild(style);
});

// Particle background effect
function createParticleBackground() {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // Insert canvas as the first element in the body
    document.body.insertBefore(canvas, document.body.firstChild);
    
    // Set canvas styles
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.zIndex = '-1';
    canvas.style.pointerEvents = 'none';
    
    // Resize canvas to fill window
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
    
    // Particle properties
    const particleCount = 100;
    const particleSize = 2;
    const particleColor = 'rgba(0, 112, 243, 0.7)';
    const connectDistance = 150;
    const connectColor = 'rgba(0, 112, 243, 0.15)';
    
    // Create particles
    const particles = [];
    
    for (let i = 0; i < particleCount; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            vx: (Math.random() - 0.5) * 0.5,
            vy: (Math.random() - 0.5) * 0.5,
            size: Math.random() * particleSize + 1
        });
    }
    
    // Animation loop
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Update and draw particles
        particles.forEach(particle => {
            // Update position
            particle.x += particle.vx;
            particle.y += particle.vy;
            
            // Bounce off edges
            if (particle.x < 0 || particle.x > canvas.width) {
                particle.vx *= -1;
            }
            
            if (particle.y < 0 || particle.y > canvas.height) {
                particle.vy *= -1;
            }
            
            // Draw particle
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            ctx.fillStyle = particleColor;
            ctx.fill();
            
            // Connect particles
            particles.forEach(otherParticle => {
                const dx = particle.x - otherParticle.x;
                const dy = particle.y - otherParticle.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < connectDistance) {
                    ctx.beginPath();
                    ctx.moveTo(particle.x, particle.y);
                    ctx.lineTo(otherParticle.x, otherParticle.y);
                    ctx.strokeStyle = connectColor;
                    ctx.lineWidth = 1 - distance / connectDistance;
                    ctx.stroke();
                }
            });
        });
        
        requestAnimationFrame(animate);
    }
    
    animate();
}

// Section scroll animations
const createScrollAnimations = () => {
    // Select all sections to animate
    const sections = document.querySelectorAll('section');
    
    // Configure the Intersection Observer
    const sectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('section-visible');
            // Unobserve after animation is triggered
            sectionObserver.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.15, // Trigger when 15% of the section is visible
        rootMargin: '0px 0px -100px 0px' // Adjust timing to trigger earlier
      }
    );
    
    // Apply observer to all sections
    sections.forEach((section) => {
      section.classList.add('section-hidden');
      sectionObserver.observe(section);
    });
  };
  

// Initialize particle background
createParticleBackground();



// Animation initialization script
document.addEventListener('DOMContentLoaded', function() {
    console.log('Animation script loaded');
    
    // Initialize AOS only for non-custom animations
    AOS.init({
        duration: 800,
        once: true,
        disable: 'mobile' // Disable AOS on mobile devices for better performance
    });
    
    // Mobile menu toggle
    const mobileMenuBtn = document.querySelector('.mobile-menu');
    const navLinks = document.querySelector('.nav-links');
    
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', function() {
            navLinks.classList.toggle('active');
        });
    }
    
    // Our custom animation elements
    const animatedElements = document.querySelectorAll('.slide-from-left, .slide-from-right, .scale-in, .fade-in, .fade-in-up, .flip-animation');
    
    // Add active class to elements in viewport
    function checkIfInView() {
        animatedElements.forEach(element => {
            const elementTop = element.getBoundingClientRect().top;
            const elementVisible = 150; // Distance from viewport to trigger
            
            if (elementTop < window.innerHeight - elementVisible) {
                if (!element.classList.contains('active')) {
                    console.log('Adding active class to', element);
                    element.classList.add('active');
                }
            }
        });
    }
    
    // Handle skill tags animation separately
    const skillTags = document.querySelectorAll('.skill-tag');
    function animateSkillTags() {
        const aboutSection = document.querySelector('.about');
        if (!aboutSection) return;
        
        const aboutTop = aboutSection.getBoundingClientRect().top;
        if (aboutTop < window.innerHeight - 300) {
            skillTags.forEach((tag, index) => {
                setTimeout(() => {
                    tag.classList.add('fade-in-up');
                    tag.classList.add('active');
                }, 300 + (index * 50));
            });
        }
    }
    
    // Trigger animations for elements that are already in view on load
    function triggerInitialAnimations() {
        // Force immediate animation for hero section
        const heroElements = document.querySelectorAll('.hero .subtitle, .hero h1, .hero p, .hero-buttons, .social-links');
        heroElements.forEach(el => {
            el.classList.add('active');
        });
        
        // Check other elements
        checkIfInView();
        animateSkillTags();
    }
    
    // Run animations on scroll and initial load
    window.addEventListener('scroll', function() {
        checkIfInView();
        animateSkillTags();
    });
    
    // Wait a bit for page to render then trigger initial animations
    setTimeout(triggerInitialAnimations, 100);
});