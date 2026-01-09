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

        // Add hover sound effect placeholder
        bubble.addEventListener('mouseenter', function () {
            console.log(`Hovering over ${this.getAttribute('data-skill')}`);
        });
    });

    // ===== SKILL DETAIL PAGE =====
    const urlParams = new URLSearchParams(window.location.search);
    const skillName = urlParams.get('skill');

    if (skillName) {
        const skillNameElement = document.getElementById('skillName');
        if (skillNameElement) {
            skillNameElement.textContent = skillName;
            document.title = `${skillName} - Job Market Analytics`;
        }
    }

    // ===== LOAD REAL CHART DATA =====
    // This replaces the artificial bars with real data from your Python aggregation
    fetch('data/ExperienceStats.json')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            renderSalaryChart(data);
        })
        .catch(error => {
            console.error('Error loading chart data:', error);
        });

    // ===== CHART INTERACTIONS =====
    const chartElements = document.querySelectorAll('.bar, .scatter-point, .word-item');

    chartElements.forEach(element => {
        element.addEventListener('mouseenter', function () {
            console.log('Chart element hovered');
        });
    });

    // ===== SMOOTH SCROLL =====
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

    const chartSections = document.querySelectorAll('.chart-section');
    chartSections.forEach(section => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(30px)';
        section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        chartObserver.observe(section);
    });

    console.log('Job Market Analytics initialized');
});

// ===== HELPER FUNCTIONS =====

// Renders the Level vs Salary chart using real JSON data
function renderSalaryChart(data) {
    const chartContainer = document.querySelector('#levelSalaryChart .bar-chart-placeholder');
    if (!chartContainer) return;

    // 1. Clean container
    chartContainer.innerHTML = '';
    
    // 2. Setup styles for the new layout (Side-by-side: Axis | Bars)
    // We modify the container to use Flexbox to hold the Scale and the Bars apart
    chartContainer.style.display = 'flex';
    chartContainer.style.alignItems = 'flex-end';
    chartContainer.style.paddingLeft = '10px'; // Space for axis
    
    // 3. Sort Data (Logical Order)
    const order = ['Junior', 'Mid', 'Senior', 'C-level', 'Lead', 'Principal'];
    data.sort((a, b) => {
        let indexA = order.indexOf(a.experience_level);
        let indexB = order.indexOf(b.experience_level);
        if (indexA === -1) indexA = 99;
        if (indexB === -1) indexB = 99;
        return indexA - indexB;
    });

    const maxSalary = Math.max(...data.map(item => item.average_salary));
    // Round up max salary to nearest 1000 for a cleaner top value on the scale
    const scaleMax = Math.ceil(maxSalary / 1000) * 1000;

    // 4. Create Y-Axis (Scale)
    const axisContainer = document.createElement('div');
    axisContainer.style.display = 'flex';
    axisContainer.style.flexDirection = 'column-reverse'; // 0 at bottom
    axisContainer.style.justifyContent = 'space-between';
    axisContainer.style.height = '100%';
    axisContainer.style.marginRight = '15px';
    axisContainer.style.paddingBottom = '24px'; // Align with bottom of bars (excluding labels)
    axisContainer.style.color = '#666';
    axisContainer.style.fontSize = '12px';
    axisContainer.style.position = 'relative';

    // Add "EUR" Annotation at the top
    const currencyLabel = document.createElement('span');
    currencyLabel.textContent = '(EUR)';
    currencyLabel.style.position = 'absolute';
    currencyLabel.style.top = '-20px';
    currencyLabel.style.left = '0';
    currencyLabel.style.fontWeight = 'bold';
    currencyLabel.style.fontSize = '10px';
    currencyLabel.style.whiteSpace = 'nowrap';
    axisContainer.appendChild(currencyLabel);

    // Create 5 scale steps (0%, 25%, 50%, 75%, 100%)
    const steps = 5;
    for (let i = 0; i <= steps; i++) {
        const value = Math.round((scaleMax / steps) * i);
        const tick = document.createElement('div');
        tick.textContent = value > 0 ? `${(value / 1000).toFixed(1)}k` : '0';
        tick.style.height = '0'; // Don't take up space in flow, just position
        tick.style.display = 'flex';
        tick.style.alignItems = 'center';
        tick.style.lineHeight = '0';
        axisContainer.appendChild(tick);
    }
    
    chartContainer.appendChild(axisContainer);

    // 5. Create Bars Container
    const barsContainer = document.createElement('div');
    barsContainer.style.display = 'flex';
    barsContainer.style.alignItems = 'flex-end';
    barsContainer.style.justifyContent = 'space-around';
    barsContainer.style.flexGrow = '1';
    barsContainer.style.height = '100%';
    
    // Updated Colors - Replaced the light beige with a visible Gold/Mustard
    const colors = ['#C85A3E', '#3A4D39', '#2B2B2B', '#D4A373']; 

    data.forEach((item, index) => {
        if (!item.average_salary || item.experience_level === 'Unknown') return;

        const barWrapper = document.createElement('div');
        barWrapper.className = 'bar'; // Keep original class for any CSS animations
        
        // Adjust style to fit new flex container
        barWrapper.style.width = '12%'; 
        barWrapper.style.margin = '0 1%';
        
        // Calculate height relative to our new nice scaleMax, not exact maxSalary
        const heightPercent = (item.average_salary / scaleMax) * 100;
        
        barWrapper.style.setProperty('--height', `${heightPercent}%`);
        barWrapper.style.setProperty('--color', colors[index % colors.length]);
        barWrapper.title = `€${item.average_salary.toFixed(0)}`;

        const label = document.createElement('span');
        label.className = 'bar-label';
        label.textContent = item.experience_level;
        
        barWrapper.appendChild(label);
        barsContainer.appendChild(barWrapper);
        
        // Hover log
        barWrapper.addEventListener('mouseenter', function() {
            console.log(`Hovered: ${item.experience_level} - €${item.average_salary}`);
        });
    });

    chartContainer.appendChild(barsContainer);
}