// ===== SKILL DETAIL PAGE =====
document.addEventListener('DOMContentLoaded', function () {
    // Get skill name from URL parameter
    const urlParams = new URLSearchParams(window.location.search);
    const skillName = urlParams.get('skill');

    if (!skillName) {
        console.error('No skill specified in URL');
        return;
    }

    // Update skill name in header
    const skillNameElement = document.getElementById('skillName');
    if (skillNameElement) {
        skillNameElement.textContent = skillName;
        document.title = `${skillName} - Job Market Analytics`;
    }

    // Initialize data processor
    const processor = new SkillDataProcessor();

    try {
        console.log('Attempting to load data...');

        // Load data (now synchronous)
        processor.loadData();

        console.log('Data loaded successfully!');

        // Get offer count
        const offerCount = processor.getOfferCount(skillName);
        console.log(`Found ${offerCount} offers for ${skillName}`);

        if (offerCount === 0) {
            console.warn(`No offers found for skill: ${skillName}`);
            showNoDataMessage();
            return;
        }

        // Get data for all three charts
        const experienceData = processor.getExperienceLevelData(skillName);
        const workModeData = processor.getWorkModeData(skillName);
        const contractTypeData = processor.getContractTypeData(skillName);

        // Render the pie charts
        renderPieChart('contractTypeChart', contractTypeData, getContractColors());
        renderPieChart('workModeChart', workModeData, getWorkModeColors());
        renderPieChart('experienceLevelChart', experienceData, getExperienceColors());

    } catch (error) {
        console.error('Error loading skill data:', error);
        showErrorMessage();
    }

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

    // Observe all chart sections
    const chartSections = document.querySelectorAll('.chart-section');
    chartSections.forEach(section => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(30px)';
        section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        chartObserver.observe(section);
    });
});

// ===== PIE CHART RENDERING =====

/**
 * Render a pie chart with SVG
 * @param {string} containerId - ID of the container element
 * @param {Array} data - Array of {label, value, percentage} objects
 * @param {Array} colors - Array of color strings
 */
function renderPieChart(containerId, data, colors) {
    console.log(`Rendering chart: ${containerId}`, data);

    const container = document.getElementById(containerId);
    if (!container) {
        console.error(`Container ${containerId} not found`);
        return;
    }

    // Clear existing content
    const placeholder = container.querySelector('.chart-placeholder');
    if (placeholder) {
        placeholder.innerHTML = '';
    }

    if (!data || data.length === 0) {
        placeholder.innerHTML = '<p style="text-align: center; padding: 40px; color: #666;">No data available</p>';
        return;
    }

    // Create pie chart container
    const pieContainer = document.createElement('div');
    pieContainer.className = 'pie-chart-placeholder small';

    // Create SVG
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 200 200');
    svg.setAttribute('class', 'pie-svg');

    // Calculate total for percentages
    const total = data.reduce((sum, item) => sum + item.value, 0);
    const circumference = 2 * Math.PI * 80; // radius = 80

    let currentOffset = 0;

    data.forEach((item, index) => {
        const percentage = item.value / total;
        const dashArray = percentage * circumference;
        const color = colors[index % colors.length];

        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('cx', '100');
        circle.setAttribute('cy', '100');
        circle.setAttribute('r', '80');
        circle.setAttribute('fill', 'none');
        circle.setAttribute('stroke', color);
        circle.setAttribute('stroke-width', '40');
        circle.setAttribute('stroke-dasharray', `${dashArray} ${circumference}`);
        circle.setAttribute('stroke-dashoffset', currentOffset);
        circle.setAttribute('transform', 'rotate(-90 100 100)');

        svg.appendChild(circle);
        currentOffset -= dashArray;
    });

    // Create legend
    const legend = document.createElement('div');
    legend.className = 'pie-legend';

    data.forEach((item, index) => {
        const color = colors[index % colors.length];

        const legendItem = document.createElement('div');
        legendItem.className = 'legend-item';

        const colorBox = document.createElement('span');
        colorBox.className = 'legend-color';
        colorBox.style.background = color;

        const labelText = document.createTextNode(` ${item.label} (${item.percentage}%)`);

        legendItem.appendChild(colorBox);
        legendItem.appendChild(labelText);
        legend.appendChild(legendItem);
    });

    pieContainer.appendChild(svg);
    pieContainer.appendChild(legend);
    placeholder.appendChild(pieContainer);
}

/**
 * Color schemes for different chart types
 */
function getExperienceColors() {
    return ['#C85A3E', '#3A4D39', '#2B2B2B', '#D4A574']; // Junior, Mid, Senior, Lead (gold)
}


function getWorkModeColors() {
    return ['#3A4D39', '#C85A3E', '#E8DCC4', '#2B2B2B'];
}

function getContractColors() {
    return ['#C85A3E', '#3A4D39', '#2B2B2B', '#E8DCC4'];
}

/**
 * Show message when no data is available
 */
function showNoDataMessage() {
    const charts = ['experienceLevelChart', 'workModeChart', 'contractTypeChart'];
    charts.forEach(chartId => {
        const container = document.getElementById(chartId);
        if (container) {
            const placeholder = container.querySelector('.chart-placeholder');
            if (placeholder) {
                placeholder.innerHTML = '<p style="text-align: center; padding: 40px; color: #666;">No job offers found for this skill</p>';
            }
        }
    });
}

/**
 * Show error message
 */
function showErrorMessage() {
    const charts = ['experienceLevelChart', 'workModeChart', 'contractTypeChart'];
    charts.forEach(chartId => {
        const container = document.getElementById(chartId);
        if (container) {
            const placeholder = container.querySelector('.chart-placeholder');
            if (placeholder) {
                placeholder.innerHTML = '<p style="text-align: center; padding: 40px; color: #C85A3E;">Error loading data - Check browser console (F12) for details</p>';
            }
        }
    });
}
