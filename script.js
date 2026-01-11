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

    // ===== LOAD REAL CHART DATA =====
    // This replaces the artificial bars with real data from your Python aggregation

    fetch('data/CategoryStats.json')
        .then(res => res.json())
        .then(data => renderCategoryChart(data))
        .catch(err => console.error('Error loading categories:', err));

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

    // 2. NEW: Fetch Skill Correlation Data (Scatter Plot)
    fetch('data/SkillVsSalary.json')
        .then(response => {
            if (!response.ok) throw new Error('Network response was not ok');
            return response.json();
        })
        .then(data => {
            // --- PLOT 1: OVERVIEW (Full Data) ---
            const salaries = data.map(d => d.avg_salary);
            const maxSal = Math.ceil(Math.max(...salaries) / 1000) * 1000;

            createScatterChart(data, {
                containerId: '#skillCorrelationChart',
                xMin: 1, xMax: 5,
                // CHANGE: 4 steps creates exactly 5 ticks: 1, 2, 3, 4, 5
                xSteps: 4,
                yMin: 0, yMax: maxSal,
                xLabel: 'Avg Required Level (1-5)',
                jitterAmount: 0,
                labelThresholdSalary: 6000,
                labelThresholdCount: 20
            });

            // --- PLOT 2: DEEP DIVE (Trimmed Data) ---
            // Here is where we "Trim the bubbles" for the zoom
            const trimmedData = data.filter(item => {
                // 1. Must be within our zoom range
                const inRange = item.avg_level >= 3.0 && item.avg_level <= 3.8 &&
                    item.avg_salary >= 3600 && item.avg_salary <= 7000;

                // 2. TRIM NOISE: Only show skills with at least 5 offers
                // This removes the tiny dots that make the chart unreadable
                const isSignificant = item.count >= 5;

                return inRange && isSignificant;
            });

            createScatterChart(trimmedData, {
                containerId: '#skillCorrelationChartZoom',
                xMin: 3.0, xMax: 3.8,
                yMin: 3600, yMax: 7000,
                xLabel: 'Zoomed Level (3.0 - 3.8)',
                jitterAmount: 0.15, // Low jitter for precision
                labelThresholdSalary: 5000, // Lower threshold so more labels show up in zoom
                labelThresholdCount: 10
            });
        })
        .catch(error => {
            console.error('Error loading skill data:', error);
        });

    // 3. NEW: Render Edge Bundling Graph
    try {
        const edgeBundlingProcessor = new EdgeBundlingProcessor();
        edgeBundlingProcessor.loadData();
        edgeBundlingProcessor.renderEdgeBundling('#edgeBundlingChart .edge-bundling-container', {
            diameter: 960,
            innerRadiusOffset: 120,
            bundleTension: 0.85,
            topSkills: 80,
            minJaccard: 0.08
        });
    } catch (error) {
        console.error('Error rendering edge bundling graph:', error);
    }

    // ===== CHART INTERACTIONS =====
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

    // Observe hero graph
    const heroGraph = document.querySelector('.hero-graph');
    if (heroGraph) {
        heroGraph.style.opacity = '0';
        heroGraph.style.transform = 'translateY(30px)';
        heroGraph.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        chartObserver.observe(heroGraph);
    }

    // ===== PLACEHOLDER FOR FUTURE FEATURES =====


    console.log('Job Market Analytics initialized');
});


// ===== HELPER FUNCTIONS =====
function renderSalaryChart(data) {
    const chartContainer = document.querySelector('#levelSalaryChart .bar-chart-placeholder');
    if (!chartContainer) return;

    chartContainer.innerHTML = '';

    // Layout: Flexbox for Axis + Bars
    chartContainer.style.display = 'flex';
    chartContainer.style.alignItems = 'flex-end';
    chartContainer.style.paddingLeft = '10px';

    // Sort Levels
    const order = ['Junior', 'Mid', 'Senior', 'C-level', 'Lead', 'Principal'];
    data.sort((a, b) => {
        let indexA = order.indexOf(a.experience_level);
        let indexB = order.indexOf(b.experience_level);
        if (indexA === -1) indexA = 99;
        if (indexB === -1) indexB = 99;
        return indexA - indexB;
    });

    const maxSalary = Math.max(...data.map(item => item.average_salary));
    const scaleMax = Math.ceil(maxSalary / 1000) * 1000;

    // Draw Y-Axis (Scale)
    const axisContainer = document.createElement('div');
    axisContainer.style.display = 'flex';
    axisContainer.style.flexDirection = 'column-reverse';
    axisContainer.style.justifyContent = 'space-between';
    axisContainer.style.height = '100%';
    axisContainer.style.marginRight = '15px';
    axisContainer.style.paddingBottom = '24px';
    axisContainer.style.color = '#666';
    axisContainer.style.fontSize = '12px';
    axisContainer.style.position = 'relative';

    const currencyLabel = document.createElement('span');
    currencyLabel.textContent = '(EUR)';
    currencyLabel.style.position = 'absolute';
    currencyLabel.style.top = '-20px';
    currencyLabel.style.left = '0';
    currencyLabel.style.fontWeight = 'bold';
    currencyLabel.style.fontSize = '10px';
    currencyLabel.style.whiteSpace = 'nowrap';
    axisContainer.appendChild(currencyLabel);

    for (let i = 0; i <= 5; i++) {
        const value = Math.round((scaleMax / 5) * i);
        const tick = document.createElement('div');
        tick.textContent = value > 0 ? `${(value / 1000).toFixed(1)}k` : '0';
        tick.style.height = '0';
        tick.style.display = 'flex';
        tick.style.alignItems = 'center';
        axisContainer.appendChild(tick);
    }
    chartContainer.appendChild(axisContainer);

    // Draw Bars
    const barsContainer = document.createElement('div');
    barsContainer.style.display = 'flex';
    barsContainer.style.alignItems = 'flex-end';
    barsContainer.style.justifyContent = 'space-around';
    barsContainer.style.flexGrow = '1';
    barsContainer.style.height = '100%';

    const colors = ['#C85A3E', '#3A4D39', '#2B2B2B', '#D4A373'];

    data.forEach((item, index) => {
        if (!item.average_salary || item.experience_level === 'Unknown') return;

        const barWrapper = document.createElement('div');
        barWrapper.className = 'bar';
        barWrapper.style.width = '12%';
        barWrapper.style.margin = '0 1%';

        const heightPercent = (item.average_salary / scaleMax) * 100;

        barWrapper.style.setProperty('--height', `${heightPercent}%`);
        barWrapper.style.setProperty('--color', colors[index % colors.length]);
        barWrapper.title = `€${item.average_salary.toFixed(0)}`;

        const label = document.createElement('span');
        label.className = 'bar-label';
        label.textContent = item.experience_level;

        barWrapper.appendChild(label);
        barsContainer.appendChild(barWrapper);
    });

    chartContainer.appendChild(barsContainer);
}

function renderScatterPlot(data) {
    const container = document.querySelector('#skillCorrelationChart .chart-placeholder');
    if (!container) return;

    container.innerHTML = ''; // Clear loading text

    // Setup container
    container.style.position = 'relative';
    container.style.height = '100%';
    container.style.boxSizing = 'border-box';
    // Add padding for axes: Top, Right, Bottom (X-axis), Left (Y-axis)
    container.style.padding = '20px 40px 50px 60px';
    container.style.borderLeft = '1px solid #ccc';
    container.style.borderBottom = '1px solid #ccc';

    // 1. Determine Scale
    const salaries = data.map(d => d.avg_salary);
    const maxSalary = Math.ceil(Math.max(...salaries) / 1000) * 1000;

    // 2. Create Y-Axis (Salary)
    const ySteps = 5;
    for (let i = 0; i <= ySteps; i++) {
        const value = Math.round((maxSalary / ySteps) * i);

        // Tick Label
        const label = document.createElement('div');
        label.textContent = value > 0 ? `${value / 1000}k` : '0';
        label.style.position = 'absolute';
        label.style.left = '-45px';
        label.style.bottom = `${(i / ySteps) * 100}%`;
        label.style.transform = 'translateY(50%)';
        label.style.fontSize = '12px';
        label.style.color = '#666';
        container.appendChild(label);

        // Grid Line
        if (i > 0) {
            const gridLine = document.createElement('div');
            gridLine.style.position = 'absolute';
            gridLine.style.left = '0';
            gridLine.style.right = '0';
            gridLine.style.bottom = `${(i / ySteps) * 100}%`;
            gridLine.style.borderTop = '1px dashed #eee';
            gridLine.style.zIndex = '0';
            container.appendChild(gridLine);
        }
    }

    // Y-Axis Title
    const yAxisTitle = document.createElement('div');
    yAxisTitle.textContent = 'Avg Salary (EUR)';
    yAxisTitle.style.position = 'absolute';
    yAxisTitle.style.top = '-20px';
    yAxisTitle.style.left = '-60px';
    yAxisTitle.style.fontSize = '12px';
    yAxisTitle.style.fontWeight = 'bold';
    container.appendChild(yAxisTitle);

    // 3. Create X-Axis (Levels 1-5)
    const xLevels = [2.5, 2.75, 3, 3.25, 3.5]; // Midpoints for levels 1-5
    xLevels.forEach(level => {
        // Map 1..5 to 0..100% width
        const leftPercent = ((level - 3.5) / 1) * 100;

        // Tick Label
        const label = document.createElement('div');
        label.textContent = level;
        label.style.position = 'absolute';
        label.style.left = `${leftPercent}%`;
        label.style.bottom = '-30px';
        label.style.transform = 'translateX(-50%)';
        label.style.fontSize = '12px';
        label.style.color = '#666';
        container.appendChild(label);

        // Vertical Grid Line
        const gridLine = document.createElement('div');
        gridLine.style.position = 'absolute';
        gridLine.style.top = '0';
        gridLine.style.bottom = '0';
        gridLine.style.left = `${leftPercent}%`;
        gridLine.style.borderLeft = '1px dashed #eee';
        gridLine.style.zIndex = '0';
        container.appendChild(gridLine);
    });

    // X-Axis Title
    const xAxisTitle = document.createElement('div');
    xAxisTitle.textContent = 'Avg Required Level (1=Junior, 5=Expert)';
    xAxisTitle.style.position = 'absolute';
    xAxisTitle.style.bottom = '-50px';
    xAxisTitle.style.width = '100%';
    xAxisTitle.style.textAlign = 'center';
    xAxisTitle.style.fontSize = '12px';
    xAxisTitle.style.fontWeight = 'bold';
    container.appendChild(xAxisTitle);

    // 4. Plot Bubbles
    data.forEach(item => {
        const bubble = document.createElement('div');

        // Calculate Position
        const xPercent = ((item.avg_level - 1) / 4) * 100;
        const yPercent = (item.avg_salary / maxSalary) * 100;

        // Size based on popularity (clamped between 10px and 40px)
        const size = Math.max(3, Math.min(10, item.count * 2));

        // Styles
        bubble.style.position = 'absolute';
        bubble.style.left = `${xPercent}%`;
        bubble.style.bottom = `${yPercent}%`;
        bubble.style.width = `${size}px`;
        bubble.style.height = `${size}px`;
        bubble.style.borderRadius = '50%';
        bubble.style.backgroundColor = 'rgba(58, 77, 57, 0.6)'; // Theme green
        bubble.style.border = '1px solid #3A4D39';
        bubble.style.transform = 'translate(-50%, 50%)';
        bubble.style.cursor = 'pointer';
        bubble.style.zIndex = '2';

        // Tooltip
        bubble.title = `${item.skill}\nLevel: ${item.avg_level}\nSalary: €${item.avg_salary}\nOffers: ${item.count}`;

        // Add Label for top skills
        if (item.avg_salary > 6000 || item.count > 15) {
            const text = document.createElement('span');
            text.textContent = item.skill;
            text.style.position = 'absolute';
            text.style.left = '12px';
            text.style.top = '-12px';
            text.style.fontSize = '10px';
            text.style.color = '#333';
            text.style.pointerEvents = 'none';
            text.style.whiteSpace = 'nowrap';
            text.style.textShadow = '0 0 2px white';
            bubble.appendChild(text);
        }

        // Hover Animation
        bubble.addEventListener('mouseenter', () => {
            bubble.style.backgroundColor = '#C85A3E'; // Theme orange
            bubble.style.zIndex = '10';
            bubble.style.transform = 'translate(-50%, 50%) scale(1.2)';
        });
        bubble.addEventListener('mouseleave', () => {
            bubble.style.backgroundColor = 'rgba(58, 77, 57, 0.6)';
            bubble.style.zIndex = '2';
            bubble.style.transform = 'translate(-50%, 50%) scale(1)';
        });

        container.appendChild(bubble);
    });
}
// Renders the Level vs Salary chart using real JSON data
function createScatterChart(data, config) {
    const container = document.querySelector(`${config.containerId} .chart-placeholder`);
    if (!container) return;

    container.innerHTML = '';

    // Layout
    container.style.position = 'relative';
    container.style.height = '100%';
    container.style.boxSizing = 'border-box';
    container.style.padding = '20px 40px 50px 60px';
    container.style.borderLeft = '1px solid #ccc';
    container.style.borderBottom = '1px solid #ccc';

    const { xMin, xMax, yMin, yMax } = config;


    // --- A. Draw Y-Axis ---
    const ySteps = 5;
    for (let i = 0; i <= ySteps; i++) {
        const value = yMin + ((yMax - yMin) / ySteps) * i;
        const label = document.createElement('div');
        label.textContent = `${(value / 1000).toFixed(1)}k`;
        label.style.position = 'absolute';
        label.style.left = '-50px';
        label.style.bottom = `${(i / ySteps) * 100}%`;
        label.style.transform = 'translateY(50%)';
        label.style.fontSize = '11px';
        label.style.color = '#666';
        label.style.textAlign = 'right';
        label.style.width = '40px';
        container.appendChild(label);

        if (i > 0) {
            const gridLine = document.createElement('div');
            gridLine.style.position = 'absolute';
            gridLine.style.left = '0';
            gridLine.style.right = '0';
            gridLine.style.bottom = `${(i / ySteps) * 100}%`;
            gridLine.style.borderTop = '1px dashed #eee';
            container.appendChild(gridLine);
        }
    }

    // --- B. Draw X-Axis ---
    const xSteps = 4;
    for (let i = 0; i <= xSteps; i++) {
        const value = xMin + ((xMax - xMin) / xSteps) * i;
        const label = document.createElement('div');
        label.textContent = value.toFixed(1);
        label.style.position = 'absolute';
        label.style.left = `${(i / xSteps) * 100}%`;
        label.style.bottom = '-30px';
        label.style.transform = 'translateX(-50%)';
        label.style.fontSize = '12px';
        label.style.color = '#666';
        container.appendChild(label);

        const gridLine = document.createElement('div');
        gridLine.style.position = 'absolute';
        gridLine.style.top = '0';
        gridLine.style.bottom = '0';
        gridLine.style.left = `${(i / xSteps) * 100}%`;
        gridLine.style.borderLeft = '1px dashed #eee';
        container.appendChild(gridLine);
    }

    // Axis Titles
    const yTitle = document.createElement('div');
    yTitle.textContent = 'EUR';
    yTitle.style.position = 'absolute';
    yTitle.style.top = '-20px';
    yTitle.style.left = '-40px';
    yTitle.style.fontSize = '12px';
    yTitle.style.fontWeight = 'bold';
    container.appendChild(yTitle);

    const xTitle = document.createElement('div');
    xTitle.textContent = config.xLabel;
    xTitle.style.position = 'absolute';
    xTitle.style.bottom = '-50px';
    xTitle.style.width = '100%';
    xTitle.style.textAlign = 'center';
    xTitle.style.fontSize = '12px';
    xTitle.style.fontWeight = 'bold';
    container.appendChild(xTitle);

    // --- C. Plot Bubbles ---
    data.forEach(item => {
        // Jitter
        const jitter = 0;
        const jitteredLevel = item.avg_level + jitter;

        // Scale to %
        const xPercent = ((jitteredLevel - xMin) / (xMax - xMin)) * 100;
        const yPercent = ((item.avg_salary - yMin) / (yMax - yMin)) * 100;

        // Skip if jitter pushed it out of bounds
        if (xPercent < 0 || xPercent > 100 || yPercent < 0 || yPercent > 100) return;

        const bubble = document.createElement('div');
        const size = Math.max(8, Math.min(20, item.count));

        bubble.style.position = 'absolute';
        bubble.style.left = `${xPercent}%`;
        bubble.style.bottom = `${yPercent}%`;
        bubble.style.width = `${size}px`;
        bubble.style.height = `${size}px`;
        bubble.style.borderRadius = '50%';
        bubble.style.backgroundColor = 'rgba(58, 77, 57, 0.5)';
        bubble.style.border = '1px solid rgba(43, 43, 43, 0.5)';
        bubble.style.transform = 'translate(-50%, 50%)';
        bubble.style.cursor = 'pointer';
        bubble.style.zIndex = '2';

        bubble.title = `${item.skill}\nLevel: ${item.avg_level}\nSalary: €${item.avg_salary}\nOffers: ${item.count}`;

        // Dynamic Labeling based on Config
        if (item.avg_salary > config.labelThresholdSalary || item.count > config.labelThresholdCount) {
            const text = document.createElement('span');
            text.textContent = item.skill;
            text.style.position = 'absolute';
            text.style.left = '10px';
            text.style.top = '-10px';
            text.style.fontSize = '10px';
            text.style.color = '#333';
            text.style.pointerEvents = 'none';
            text.style.whiteSpace = 'nowrap';
            text.style.textShadow = '0 0 2px white';
            text.style.zIndex = '5';
            bubble.appendChild(text);
        }

        // Hover
        bubble.addEventListener('mouseenter', () => {
            bubble.style.backgroundColor = '#C85A3E';
            bubble.style.opacity = '1';
            bubble.style.zIndex = '100';
            bubble.style.transform = 'translate(-50%, 50%) scale(1.4)';
        });
        bubble.addEventListener('mouseleave', () => {
            bubble.style.backgroundColor = 'rgba(58, 77, 57, 0.5)';
            bubble.style.zIndex = '2';
            bubble.style.transform = 'translate(-50%, 50%) scale(1)';
        });

        container.appendChild(bubble);
    });
}

// ===== 3. CATEGORY CHART LOGIC (Treemap) =====
// Recursive function to generate rectangles
// items: array of data objects
// x, y, w, h: bounding box in percentages (0-100)
// ===== 3. CATEGORY CHART LOGIC (Treemap - Aspect Ratio Fixed) =====
// ===== 3. CATEGORY CHART LOGIC (Robust Squarified Treemap) =====
// ===== 3. CATEGORY CHART LOGIC (Fixed Squarified Treemap) =====
function renderCategoryChart(data) {
    const container = document.querySelector('#categoryChart .chart-placeholder');
    if (!container) return;

    container.innerHTML = '';

    // Setup Container
    container.style.position = 'relative';
    container.style.width = '100%';
    container.style.height = '100%';
    container.style.overflow = 'hidden';

    // 1. DIMENSION FIX: Force valid height if DOM reports 0/small
    let containerWidth = container.offsetWidth;
    let containerHeight = container.offsetHeight;

    // If chart is hidden or loading, height might be 0. Force a default.
    if (!containerHeight || containerHeight < 100) {
        console.warn('Treemap: Container height too small, forcing 600px.');
        containerHeight = 600;
        // Optional: Force the physical container to match if it collapsed
        container.style.height = '600px';
    }

    // 2. DATA SORTING: Sort Largest to Smallest (Crucial for "Blocky" layout)
    // Random sorting creates "strips". Descending sort creates "blocks".
    const sortedData = [...data]
        .filter(item => item.count > 0)
        .sort((a, b) => b.count - a.count); // Descending

    const treeData = sortedData.slice(0, 20);
    const colors = ['#C85A3E', '#3A4D39', '#2B2B2B', '#D4A373', '#6B705C', '#A5A58D', '#4A4A4A', '#8C3D2B'];

    // Recursive function
    // x, y, w, h are percentages (0-100)
    function generateTreemap(items, x, y, w, h) {
        if (items.length === 0) return;

        // Base Case: Draw Item
        if (items.length === 1) {
            const item = items[0];
            const rect = document.createElement('div');

            rect.style.position = 'absolute';
            rect.style.left = `${x}%`;
            rect.style.top = `${y}%`;
            rect.style.width = `${w}%`;
            rect.style.height = `${h}%`;
            rect.style.backgroundColor = colors[data.indexOf(item) % colors.length];
            rect.style.border = '1px solid #fff';
            rect.style.boxSizing = 'border-box';
            rect.style.color = '#fff';
            rect.style.display = 'flex';
            rect.style.flexDirection = 'column';
            rect.style.justifyContent = 'center';
            rect.style.alignItems = 'center';
            rect.style.cursor = 'pointer';
            rect.style.transition = 'all 0.2s';
            rect.style.overflow = 'hidden';

            // Text Sizing
            const pixelW = (w / 100) * containerWidth;
            const pixelH = (h / 100) * containerHeight;
            const isTiny = pixelW < 40 || pixelH < 30;

            if (!isTiny) {
                rect.innerHTML = `
                    <span style="font-weight:bold; font-size:13px; text-align:center; padding:0 2px; text-shadow:0 1px 2px rgba(0,0,0,0.2);">${item.category}</span>
                    <span style="font-size:11px; opacity:0.9;">${item.count}</span>
                `;
            } else {
                rect.innerHTML = `<span style="font-size:10px; font-weight:bold;">${item.category.substring(0, 2)}</span>`;
            }

            rect.title = `${item.category}\nOffers: ${item.count}\nAvg Salary: €${item.avg_salary}`;

            // Hover
            rect.addEventListener('mouseenter', () => {
                rect.style.filter = 'brightness(1.15)';
                rect.style.zIndex = 10;
                rect.style.boxShadow = '0 5px 15px rgba(0,0,0,0.2)';
            });
            rect.addEventListener('mouseleave', () => {
                rect.style.filter = 'none';
                rect.style.zIndex = 1;
                rect.style.boxShadow = 'none';
            });

            container.appendChild(rect);
            return;
        }

        // --- SPLIT LOGIC ---
        // Find split point close to 50% weight
        const totalWeight = items.reduce((sum, i) => sum + i.count, 0);
        let currentWeight = 0;
        let splitIndex = 0;
        let bestDiff = Infinity;

        for (let i = 0; i < items.length; i++) {
            currentWeight += items[i].count;
            const diff = Math.abs(currentWeight - (totalWeight / 2));
            if (diff < bestDiff) {
                bestDiff = diff;
                splitIndex = i + 1;
            }
        }

        // Safety clamps
        if (splitIndex >= items.length) splitIndex = items.length - 1;
        if (splitIndex < 1) splitIndex = 1;

        const group1 = items.slice(0, splitIndex);
        const group2 = items.slice(splitIndex);

        const weight1 = group1.reduce((sum, i) => sum + i.count, 0);
        const ratio = weight1 / totalWeight;

        // --- ASPECT RATIO CHECK ---
        // Check "Current Shape" in Pixels to decide cut
        const pixelW = (w / 100) * containerWidth;
        const pixelH = (h / 100) * containerHeight;

        // If it's wider than it is tall -> Cut Vertically (Left | Right)
        // If it's taller than it is wide -> Cut Horizontally (Top / Bottom)
        if (pixelW >= pixelH) {
            const w1 = w * ratio;
            generateTreemap(group1, x, y, w1, h);
            generateTreemap(group2, x + w1, y, w - w1, h);
        } else {
            const h1 = h * ratio;
            generateTreemap(group1, x, y, w, h1);
            generateTreemap(group2, x, y + h1, w, h - h1);
        }
    }

    generateTreemap(treeData, 0, 0, 100, 100);
}