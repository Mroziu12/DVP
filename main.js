// ===== SKILL NAVIGATION =====
// Handle skill bubble clicks on main page
document.addEventListener('DOMContentLoaded', function () {
    const skillBubbles = document.querySelectorAll('.skill-bubble');

    skillBubbles.forEach(bubble => {
        bubble.addEventListener('click', function () {
            const skillName = this.getAttribute('data-skill');

            // Add click animation
            this.style.transform = 'translate(-50%, -50%) scale(0.9)';

            setTimeout(() => {
                // Navigate to skill detail page with skill name as parameter
                window.location.href = `skill-detail.html?skill=${encodeURIComponent(skillName)}`;
            }, 200);
        });

        // Add hover sound effect placeholder (can be implemented later)
        bubble.addEventListener('mouseenter', function () {
            // Placeholder for future sound effect
            console.log(`Hovering over ${this.getAttribute('data-skill')}`);
        });
    });

    // ===== SMOOTH SCROLL =====
    // Add smooth scrolling for anchor links
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

    // ===== NAVIGATION ACTIVE STATE =====
    // Update active navigation based on current page
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('.nav-links a');

    navLinks.forEach(link => {
        const linkPage = link.getAttribute('href');
        if (linkPage === currentPage) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });

    console.log('Job Market Analytics - Main Page initialized');
});
