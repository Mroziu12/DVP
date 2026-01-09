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

    // ===== SKILL DETAIL PAGE =====
    // Update skill name on detail page based on URL parameter
    const urlParams = new URLSearchParams(window.location.search);
    const skillName = urlParams.get('skill');

    if (skillName) {
        const skillNameElement = document.getElementById('skillName');
        if (skillNameElement) {
            skillNameElement.textContent = skillName;

            // Update page title
            document.title = `${skillName} - Job Market Analytics`;
        }
    }

    // ===== CHART INTERACTIONS =====
    // Add hover effects for chart elements
    const chartElements = document.querySelectorAll('.bar, .scatter-point, .word-item');

    chartElements.forEach(element => {
        element.addEventListener('mouseenter', function () {
            // Placeholder for tooltip or data display
            console.log('Chart element hovered');
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

    // ===== CHART ANIMATIONS ON SCROLL =====
    // Intersection Observer for animating charts when they come into view
    const observerOptions = {
        threshold: 0.2,
        rootMargin: '0px 0px -100px 0px'
    };

    const chartObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observe all chart sections
    const chartSections = document.querySelectorAll('.chart-section');
    chartSections.forEach(section => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(30px)';
        section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        chartObserver.observe(section);
    });

    // ===== PLACEHOLDER FOR FUTURE FEATURES =====

    // Function to load actual chart data (to be implemented)
    function loadChartData(chartId, dataUrl) {
        console.log(`Loading data for ${chartId} from ${dataUrl}`);
        // This will be implemented when real data is available
    }

    // Function to render interactive charts (to be implemented)
    function renderChart(chartId, chartType, data) {
        console.log(`Rendering ${chartType} chart in ${chartId}`);
        // This will be implemented with actual charting library
    }

    // Function to handle chart click events (to be implemented)
    function handleChartClick(event, chartData) {
        console.log('Chart clicked:', chartData);
        // This will be implemented for drill-down functionality
    }

    // Function to export chart data (to be implemented)
    function exportChartData(chartId, format) {
        console.log(`Exporting ${chartId} as ${format}`);
        // This will be implemented for data export functionality
    }

    console.log('Job Market Analytics initialized');
});
