// Particle Network Animation
// Create an interactive, dynamic background for your portfolio
document.addEventListener('DOMContentLoaded', function() {
    console.log("Particles animation initializing"); // Debug message
    
    // Create canvas element
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
    canvas.style.zIndex = '-2'; // Changed from -1 to -2 to ensure it's behind all content
    canvas.style.pointerEvents = 'none';
    
    // Resize canvas to fill window
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
    
    // Particle properties
    const particleCount = 80; // Reduced for better performance
    const particleMinSize = 1;
    const particleMaxSize = 3;
    const particleMinSpeed = 0.1;
    const particleMaxSpeed = 0.3;
    const particleColor = 'rgba(0, 112, 243, 0.7)'; // Your theme blue color
    const connectDistance = 150;
    const connectColor = 'rgba(0, 112, 243, 0.15)'; // Lighter version of your theme color
    
    // Create particles
    const particles = [];
    
    for (let i = 0; i < particleCount; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            vx: (Math.random() - 0.5) * (particleMaxSpeed - particleMinSpeed) + particleMinSpeed,
            vy: (Math.random() - 0.5) * (particleMaxSpeed - particleMinSpeed) + particleMinSpeed,
            size: Math.random() * (particleMaxSize - particleMinSize) + particleMinSize,
            opacity: Math.random() * 0.5 + 0.3
        });
    }
    
    // Animation loop
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw a semi-transparent overlay to see particles better against dark backgrounds
        ctx.fillStyle = 'rgba(18, 18, 18, 0.05)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Update and draw particles
        particles.forEach((particle, index) => {
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
            ctx.globalAlpha = particle.opacity;
            ctx.fill();
            ctx.globalAlpha = 1;
            
            // Connect particles
            for (let j = index + 1; j < particles.length; j++) {
                const particle2 = particles[j];
                const dx = particle.x - particle2.x;
                const dy = particle.y - particle2.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < connectDistance) {
                    ctx.beginPath();
                    ctx.moveTo(particle.x, particle.y);
                    ctx.lineTo(particle2.x, particle2.y);
                    
                    // Calculate line opacity based on distance
                    const opacity = 1 - (distance / connectDistance);
                    ctx.strokeStyle = connectColor;
                    ctx.globalAlpha = opacity * 0.8;
                    ctx.lineWidth = 1;
                    ctx.stroke();
                    ctx.globalAlpha = 1;
                }
            }
        });
        
        requestAnimationFrame(animate);
    }
    
    // Start animation
    animate();
    console.log("Particles animation started"); // Confirm animation has started
});