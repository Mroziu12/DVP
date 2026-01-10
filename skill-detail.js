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

        // Render the word cloud
        renderWordCloud(skillName);

        // Render the boxplot
        renderBoxplot(skillName);

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

// ===== WORD CLOUD RENDERING =====

/**
 * Render word cloud for related technologies
 * @param {string} skillName - Name of the skill to show related technologies for
 */
async function renderWordCloud(skillName) {
    console.log(`Rendering word cloud for: ${skillName}`);

    const container = document.getElementById('wordCloudChart');
    if (!container) {
        console.error('Word cloud container not found');
        return;
    }

    const placeholder = container.querySelector('.chart-placeholder');
    if (!placeholder) {
        console.error('Word cloud placeholder not found');
        return;
    }

    try {
        // Initialize word cloud processor
        const processor = new WordCloudProcessor();
        processor.loadData();

        // Get related technologies (top 30, minimum Jaccard 0.01)
        const relatedTechs = await processor.getRelatedTechnologies(skillName, 30, 0.01);

        console.log(`Found ${relatedTechs.length} related technologies for ${skillName}`);

        if (relatedTechs.length === 0) {
            placeholder.innerHTML = '<p style="text-align: center; padding: 60px; color: #666;">No related technologies found</p>';
            return;
        }

        // Clear placeholder
        placeholder.innerHTML = '';

        // Create word cloud container
        const wordCloudDiv = document.createElement('div');
        wordCloudDiv.className = 'word-cloud-container';

        // Create words
        relatedTechs.forEach(tech => {
            const wordItem = document.createElement('span');
            wordItem.className = 'word-item';
            wordItem.textContent = tech.technology;

            // Set CSS custom properties for positioning and sizing
            wordItem.style.setProperty('--size', `${tech.size}px`);
            wordItem.style.setProperty('--x', `${tech.x}%`);
            wordItem.style.setProperty('--y', `${tech.y}%`);

            // Set color based on Jaccard index
            const color = processor.getWordColor(tech.jaccardIndex);
            wordItem.style.color = color;

            // Create tooltip
            const tooltip = document.createElement('div');
            tooltip.className = 'word-tooltip';
            tooltip.innerHTML = `
                <strong>${tech.technology}</strong><br>
                Co-occurrences: ${tech.coOccurrenceCount}
            `;
            wordItem.appendChild(tooltip);

            // Add hover effect
            wordItem.addEventListener('mouseenter', function () {
                this.style.zIndex = '100';
            });

            wordItem.addEventListener('mouseleave', function () {
                this.style.zIndex = '1';
            });

            wordCloudDiv.appendChild(wordItem);
        });

        placeholder.appendChild(wordCloudDiv);

    } catch (error) {
        console.error('Error rendering word cloud:', error);
        placeholder.innerHTML = '<p style="text-align: center; padding: 60px; color: #C85A3E;">Error loading word cloud data</p>';
    }
}

// ===== BOXPLOT RENDERING =====

/**
 * Render boxplot for skill level vs salary
 * @param {string} skillName - Name of the skill to show boxplot for
 */
function renderBoxplot(skillName) {
    console.log(`Rendering boxplot for: ${skillName}`);

    const container = document.getElementById('boxplotChart');
    if (!container) {
        console.error('Boxplot container not found');
        return;
    }

    const placeholder = container.querySelector('.chart-placeholder');
    if (!placeholder) {
        console.error('Boxplot placeholder not found');
        return;
    }

    // Check if boxplot data is available
    if (typeof BOXPLOT_DATA === 'undefined') {
        console.error('BOXPLOT_DATA not loaded');
        placeholder.innerHTML = '<p style="text-align: center; padding: 60px; color: #C85A3E;">Boxplot data not available</p>';
        return;
    }

    // Get data for this skill
    const skillData = BOXPLOT_DATA[skillName];

    if (!skillData || Object.keys(skillData).length === 0) {
        placeholder.innerHTML = '<p style="text-align: center; padding: 60px; color: #666;">No salary data available for different skill levels</p>';
        return;
    }

    console.log(`Boxplot data for ${skillName}:`, skillData);

    // Clear placeholder
    placeholder.innerHTML = '';

    // Prepare data for D3
    const boxplotData = [];
    for (let level = 1; level <= 5; level++) {
        if (skillData[level]) {
            boxplotData.push({
                level: level,
                ...skillData[level]
            });
        }
    }

    if (boxplotData.length === 0) {
        placeholder.innerHTML = '<p style="text-align: center; padding: 60px; color: #666;">No data available</p>';
        return;
    }

    // Set up dimensions
    const margin = { top: 40, right: 40, bottom: 60, left: 80 };
    const width = 800 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    // Create SVG
    const svg = d3.select(placeholder)
        .append('svg')
        .attr('width', '100%')
        .attr('height', '100%')
        .attr('viewBox', `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
        .attr('preserveAspectRatio', 'xMidYMid meet')
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

    // Set up scales
    const xScale = d3.scaleBand()
        .domain([1, 2, 3, 4, 5])
        .range([0, width])
        .padding(0.3);

    // Calculate domain including outliers
    const allValues = boxplotData.flatMap(d => {
        const values = [d.whiskerMin, d.whiskerMax];
        if (d.outliers && d.outliers.length > 0) {
            values.push(...d.outliers);
        }
        return values;
    });
    const yScale = d3.scaleLinear()
        .domain([0, d3.max(allValues) * 1.1])
        .range([height, 0]);

    // Add X axis
    svg.append('g')
        .attr('transform', `translate(0,${height})`)
        .call(d3.axisBottom(xScale))
        .style('font-family', 'IBM Plex Mono, monospace')
        .style('font-size', '12px')
        .style('color', '#2B2B2B');

    // Add Y axis
    svg.append('g')
        .call(d3.axisLeft(yScale).ticks(8).tickFormat(d => `€${d}`))
        .style('font-family', 'IBM Plex Mono, monospace')
        .style('font-size', '12px')
        .style('color', '#2B2B2B');

    // Add X axis label
    svg.append('text')
        .attr('x', width / 2)
        .attr('y', height + 45)
        .attr('text-anchor', 'middle')
        .style('font-family', 'Crimson Pro, serif')
        .style('font-size', '14px')
        .style('fill', '#2B2B2B')
        .text('Skill Level Required');

    // Add Y axis label
    svg.append('text')
        .attr('transform', 'rotate(-90)')
        .attr('x', -height / 2)
        .attr('y', -60)
        .attr('text-anchor', 'middle')
        .style('font-family', 'Crimson Pro, serif')
        .style('font-size', '14px')
        .style('fill', '#2B2B2B')
        .text('Salary (EUR)');

    // Color scheme - softer, gentler colors
    const boxColor = '#9c9583';         // Soft sage
    const medianColor = '#B33951';      // Soft gold
    const whiskerColor = '#3b5249';     // Muted forest

    // Draw boxplots
    boxplotData.forEach(d => {
        const x = xScale(d.level);
        const boxWidth = xScale.bandwidth();

        // Vertical line (whiskers) - now using whiskerMin and whiskerMax
        svg.append('line')
            .attr('x1', x + boxWidth / 2)
            .attr('x2', x + boxWidth / 2)
            .attr('y1', yScale(d.whiskerMin))
            .attr('y2', yScale(d.whiskerMax))
            .attr('stroke', whiskerColor)
            .attr('stroke-width', 1);

        // Min whisker line
        svg.append('line')
            .attr('x1', x + boxWidth * 0.25)
            .attr('x2', x + boxWidth * 0.75)
            .attr('y1', yScale(d.whiskerMin))
            .attr('y2', yScale(d.whiskerMin))
            .attr('stroke', whiskerColor)
            .attr('stroke-width', 1);

        // Max whisker line
        svg.append('line')
            .attr('x1', x + boxWidth * 0.25)
            .attr('x2', x + boxWidth * 0.75)
            .attr('y1', yScale(d.whiskerMax))
            .attr('y2', yScale(d.whiskerMax))
            .attr('stroke', whiskerColor)
            .attr('stroke-width', 1);

        // Box (Q1 to Q3)
        const boxHeight = yScale(d.q1) - yScale(d.q3);
        svg.append('rect')
            .attr('x', x)
            .attr('y', yScale(d.q3))
            .attr('width', boxWidth)
            .attr('height', boxHeight)
            .attr('fill', boxColor)
            .attr('fill-opacity', 1)
            .attr('stroke', whiskerColor)
            .attr('stroke-width', 1);

        // Median line
        svg.append('line')
            .attr('x1', x)
            .attr('x2', x + boxWidth)
            .attr('y1', yScale(d.median))
            .attr('y2', yScale(d.median))
            .attr('stroke', medianColor)
            .attr('stroke-width', 3);

        // Draw outliers as individual points
        if (d.outliers && d.outliers.length > 0) {
            d.outliers.forEach(outlier => {
                svg.append('circle')
                    .attr('cx', x + boxWidth / 2)
                    .attr('cy', yScale(outlier))
                    .attr('r', 3)
                    .attr('fill', 'none')
                    .attr('stroke', whiskerColor)
                    .attr('stroke-width', 1.5)
                    .attr('opacity', 0.7);
            });
        }

        // Add tooltip
        const tooltip = svg.append('g')
            .attr('class', 'boxplot-tooltip')
            .style('opacity', 0)
            .style('pointer-events', 'none')
            .style('z-index', 1000);

        tooltip.append('rect')
            .attr('fill', '#2B2B2B')
            .attr('rx', 4);

        tooltip.append('text')
            .attr('fill', '#E8DCC4')
            .style('font-family', 'IBM Plex Mono, monospace')
            .style('font-size', '11px');

        // Interactive overlay
        svg.append('rect')
            .attr('x', x)
            .attr('y', 0)
            .attr('width', boxWidth)
            .attr('height', height)
            .attr('fill', 'transparent')
            .on('mouseenter', function () {
                const outlierText = d.outliers && d.outliers.length > 0 ? `\nOutliers: ${d.outliers.length}` : '';
                const tooltipText = `Level ${d.level} (n=${d.count})\nQ1: €${d.q1}\nMedian: €${d.median}\nQ3: €${d.q3}`;

                const lines = tooltipText.split('\n');
                const lineHeight = 14;
                const padding = 8;
                const textWidth = Math.max(...lines.map(line => line.length * 6.5));

                // Calculate tooltip Y position (centered on median, but keep within bounds)
                const tooltipHeight = lines.length * lineHeight + padding * 2;
                let tooltipY = yScale(d.median) - tooltipHeight / 2;

                // Keep tooltip within chart bounds
                if (tooltipY < 0) tooltipY = 10;
                if (tooltipY + tooltipHeight > height) tooltipY = height - tooltipHeight - 10;

                // Position tooltip to the left for level 5, right for others
                const tooltipX = d.level === 5 ? x - textWidth - padding * 2 - 10 : x + boxWidth + 10;

                // Position tooltip
                tooltip.select('rect')
                    .attr('x', tooltipX)
                    .attr('y', tooltipY)
                    .attr('width', textWidth + padding * 2)
                    .attr('height', tooltipHeight);

                tooltip.select('text')
                    .selectAll('tspan')
                    .data(lines)
                    .join('tspan')
                    .attr('x', tooltipX + padding)
                    .attr('y', (_, i) => tooltipY + padding + 10 + i * lineHeight)
                    .attr('text-anchor', 'start')
                    .text(d => d);

                tooltip.style('opacity', 1);

                // Bring tooltip to front
                tooltip.raise();
            })
            .on('mouseleave', function () {
                tooltip.style('opacity', 0);
            });
    });
}
