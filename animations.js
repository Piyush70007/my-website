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