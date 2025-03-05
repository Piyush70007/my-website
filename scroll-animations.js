/**
 * Comprehensive Scroll Animations with Directional Animations for All Devices
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('Enhanced scroll animations initialized');
    
    // Mobile detection (still useful for other optimizations)
    const isMobile = window.innerWidth <= 768;
    console.log('Device detected as:', isMobile ? 'Mobile' : 'Desktop/Laptop');
    
    // Function to check if element is in viewport with configurable threshold
    function isInViewport(element, threshold = 0.8) {
        const rect = element.getBoundingClientRect();
        // Adjusted threshold for mobile (show earlier when scrolling)
        const adjustedThreshold = isMobile ? 0.9 : threshold;
        return (
            rect.top <= (window.innerHeight || document.documentElement.clientHeight) * adjustedThreshold &&
            rect.bottom >= 0
        );
    }
    
    // Handle About section animations
    function handleAboutAnimation() {
        const aboutSection = document.querySelector('.about');
        const aboutText = document.querySelector('.about-text');
        const aboutParagraphs = document.querySelectorAll('.about-text p');
        const skills = document.querySelector('.skills');
        const skillTags = document.querySelectorAll('.skill-tag');
        const aboutImage = document.querySelector('.about-image');
        
        if (aboutSection && isInViewport(aboutSection, 0.85)) {
            if (aboutText && !aboutText.classList.contains('animate')) {
                console.log('Animating about section');
                
                aboutText.classList.add('animate');
                
                aboutParagraphs.forEach(paragraph => {
                    paragraph.classList.add('animate');
                });
                
                if (skills) {
                    skills.classList.add('animate');
                }
                
                skillTags.forEach(tag => {
                    tag.classList.add('animate');
                });
                
                if (aboutImage) {
                    aboutImage.classList.add('animate');
                }
                
                window.removeEventListener('scroll', handleAboutAnimation);
            }
        }
    }
    
    // Enhanced education section animation handler with directional animations for all devices
    function handleEducationAnimation() {
        const educationSection = document.querySelector('.education');
        
        // Only proceed if education section exists
        if (!educationSection) return;
        
        // If education section is in viewport
        if (isInViewport(educationSection, 0.7)) {
            console.log('Education section in viewport');
            
            // Get all education items
            const educationItems = document.querySelectorAll('.education-item');
            
            // Apply animation classes with sequential delays
            educationItems.forEach((item, index) => {
                if (!item.classList.contains('animated')) {
                    console.log('Animating education item', index + 1);
                    
                    // Mark as animated to avoid re-animation
                    item.classList.add('animated');
                    
                    // We now use the same directional animations for all devices
                    // First, remove any existing animation classes
                    item.classList.remove('slide-from-left', 'slide-from-right');
                    
                    // Apply the proper animation classes based on position
                    if (index % 2 === 0) {
                        // Even items (0, 2, etc.) slide from right
                        item.classList.add('slide-from-right', 'animate');
                    } else {
                        // Odd items (1, 3, etc.) slide from left
                        item.classList.add('slide-from-left', 'animate');
                    }
                    
                    // Add delay based on index
                    const delay = 0.2 * index;
                    item.style.animationDelay = `${delay}s`;
                }
            });
            
            // Remove the scroll listener once animations are triggered
            window.removeEventListener('scroll', handleEducationAnimation);
        }
    }
    
    // Add scroll event listeners
    window.addEventListener('scroll', handleAboutAnimation);
    window.addEventListener('scroll', handleEducationAnimation);
    
    // Check initial state (in case sections are already in view)
    setTimeout(() => {
        handleAboutAnimation();
        handleEducationAnimation();
    }, 300);
});