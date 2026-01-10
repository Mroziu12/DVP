// ===== EDGE BUNDLING PROCESSOR =====
// Processes Jaccard co-occurrence data and renders hierarchical edge bundling visualization

class EdgeBundlingProcessor {
    constructor() {
        this.data = null;
        this.topSkills = [];
        this.connections = [];
    }

    /**
     * Load Jaccard data from global window object
     */
    loadData() {
        if (typeof window.JACCARD_DATA === 'undefined') {
            throw new Error('JACCARD_DATA not found. Make sure jaccardData.js is loaded.');
        }
        this.data = window.JACCARD_DATA;
        console.log(`Loaded ${this.data.length} Jaccard index entries`);
    }

    /**
     * Extract top N skills by total co-occurrence count
     * @param {number} limit - Number of top skills to extract
     * @param {number} minJaccard - Minimum Jaccard index threshold
     * @returns {Array} Array of top skill names
     */
    extractTopSkills(limit = 100, minJaccard = 0.05) {
        // Filter by minimum Jaccard index first
        const filteredData = this.data.filter(entry => entry.jaccardIndex >= minJaccard);

        // List of language skills to exclude
        const languagesToExclude = new Set([
            'Polish', 'English', 'German', 'French', 'Spanish', 'Italian',
            'Russian', 'Chinese', 'Japanese', 'Korean', 'Portuguese',
            'Dutch', 'Swedish', 'Norwegian', 'Danish', 'Finnish',
            'Czech', 'Slovak', 'Ukrainian', 'Romanian', 'Hungarian',
            'Turkish', 'Arabic', 'Hebrew', 'Hindi', 'Vietnamese'
        ]);

        // Aggregate co-occurrence counts per skill
        const skillCounts = {};

        filteredData.forEach(entry => {
            // Skip if either skill is a language
            if (languagesToExclude.has(entry.tech1) || languagesToExclude.has(entry.tech2)) {
                return;
            }

            // Count for tech1
            if (!skillCounts[entry.tech1]) {
                skillCounts[entry.tech1] = 0;
            }
            skillCounts[entry.tech1] += entry.coOccurrenceCount;

            // Count for tech2
            if (!skillCounts[entry.tech2]) {
                skillCounts[entry.tech2] = 0;
            }
            skillCounts[entry.tech2] += entry.coOccurrenceCount;
        });

        // Sort by total co-occurrences and take top N
        const sortedSkills = Object.entries(skillCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, limit)
            .map(entry => entry[0]);

        console.log(`Extracted top ${sortedSkills.length} skills (languages excluded)`);
        return sortedSkills;
    }

    /**
     * Filter connections by minimum Jaccard index and skill inclusion
     * @param {Array} skills - Array of skill names to include
     * @param {number} minJaccard - Minimum Jaccard index threshold
     * @returns {Array} Filtered connections
     */
    filterConnections(skills, minJaccard = 0.05) {
        const skillSet = new Set(skills);

        const filtered = this.data.filter(entry => {
            return entry.jaccardIndex >= minJaccard &&
                skillSet.has(entry.tech1) &&
                skillSet.has(entry.tech2);
        });

        console.log(`Filtered to ${filtered.length} connections`);
        return filtered;
    }

    /**
     * Build hierarchical data structure for D3 edge bundling
     * @param {Array} skills - Array of skill names
     * @param {Array} connections - Array of connection objects
     * @returns {Object} Hierarchical data structure
     */
    buildHierarchy(skills, connections) {
        // Create a map of skill name to imports
        const skillImports = {};

        skills.forEach(skill => {
            skillImports[skill] = [];
        });

        // Build imports array for each skill
        connections.forEach(conn => {
            // Add bidirectional connections
            if (skillImports[conn.tech1]) {
                skillImports[conn.tech1].push(conn.tech2);
            }
            if (skillImports[conn.tech2]) {
                skillImports[conn.tech2].push(conn.tech1);
            }
        });

        // Convert to D3 hierarchy format
        const hierarchyData = skills.map(skill => ({
            name: skill,
            imports: skillImports[skill] || []
        }));

        console.log(`Built hierarchy with ${hierarchyData.length} nodes`);
        return hierarchyData;
    }

    /**
     * Main rendering function using D3.js v4
     * @param {string} containerId - ID of the container element
     * @param {Object} config - Configuration object
     */
    renderEdgeBundling(containerId, config = {}) {
        // Default configuration
        const defaults = {
            diameter: 960,
            innerRadiusOffset: 120,
            bundleTension: 0.85,
            topSkills: 100,
            minJaccard: 0.05,
            linkColor: '#3A4D39',
            linkOpacity: 0.3,
            linkHoverOpacity: 0.8,
            nodeColor: '#2B2B2B',
            nodeFontSize: '10px'
        };

        const settings = { ...defaults, ...config };

        // Get container
        const container = document.querySelector(containerId);
        if (!container) {
            console.error(`Container ${containerId} not found`);
            return;
        }

        // Clear container
        container.innerHTML = '';

        // Extract and filter data
        this.topSkills = this.extractTopSkills(settings.topSkills, settings.minJaccard);
        this.connections = this.filterConnections(this.topSkills, settings.minJaccard);
        const hierarchyData = this.buildHierarchy(this.topSkills, this.connections);

        // Create a map of connection strengths (co-occurrence counts)
        const connectionStrengthMap = new Map();
        this.connections.forEach(conn => {
            const key1 = `${conn.tech1}-${conn.tech2}`;
            const key2 = `${conn.tech2}-${conn.tech1}`;
            connectionStrengthMap.set(key1, conn.coOccurrenceCount);
            connectionStrengthMap.set(key2, conn.coOccurrenceCount);
        });

        // Calculate min and max co-occurrence for scaling
        const coOccurrenceCounts = this.connections.map(c => c.coOccurrenceCount);
        const minCoOccurrence = Math.min(...coOccurrenceCounts);
        const maxCoOccurrence = Math.max(...coOccurrenceCounts);

        // Set up dimensions
        const radius = settings.diameter / 2;
        const innerRadius = radius - settings.innerRadiusOffset;

        // Create cluster layout
        const cluster = d3.cluster()
            .size([360, innerRadius]);

        // Create radial line generator with bundle curve
        const line = d3.radialLine()
            .curve(d3.curveBundle.beta(settings.bundleTension))
            .radius(d => d.y)
            .angle(d => d.x / 180 * Math.PI);

        // Create SVG
        const svg = d3.select(container)
            .append('svg')
            .attr('width', '100%')
            .attr('height', '100%')
            .attr('viewBox', `0 0 ${settings.diameter} ${settings.diameter}`)
            .attr('preserveAspectRatio', 'xMidYMid meet')
            .append('g')
            .attr('transform', `translate(${radius},${radius})`);

        // Create groups for links and nodes
        let link = svg.append('g').selectAll('.edge-bundling-link');
        let node = svg.append('g').selectAll('.edge-bundling-node');

        // Build package hierarchy
        const root = this.packageHierarchy(hierarchyData)
            .sum(d => d.size || 1);

        // Apply cluster layout
        cluster(root);

        // Function to get stroke width based on co-occurrence count
        const getStrokeWidth = (sourceName, targetName) => {
            const key = `${sourceName}-${targetName}`;
            const coOccurrence = connectionStrengthMap.get(key) || 0;

            // Scale stroke width between 0.5 and 5 pixels based on co-occurrence
            const minWidth = 0.5;
            const maxWidth = 5;
            const normalized = (coOccurrence - minCoOccurrence) / (maxCoOccurrence - minCoOccurrence);
            return minWidth + (normalized * (maxWidth - minWidth));
        };

        // Draw links with variable stroke width
        link = link
            .data(this.packageImports(root.leaves()))
            .enter()
            .append('path')
            .each(function (d) {
                d.source = d[0];
                d.target = d[d.length - 1];
            })
            .attr('class', 'edge-bundling-link')
            .attr('d', line)
            .style('stroke', settings.linkColor)
            .style('stroke-opacity', settings.linkOpacity)
            .style('stroke-width', d => getStrokeWidth(d.source.data.key, d.target.data.key))
            .style('fill', 'none')
            .style('pointer-events', 'none');

        // Draw nodes (text labels)
        node = node
            .data(root.leaves())
            .enter()
            .append('text')
            .attr('class', 'edge-bundling-node')
            .attr('dy', '0.31em')
            .attr('transform', d => {
                return `rotate(${d.x - 90})translate(${d.y + 8},0)${d.x < 180 ? '' : 'rotate(180)'}`;
            })
            .attr('text-anchor', d => d.x < 180 ? 'start' : 'end')
            .text(d => d.data.key)
            .style('font-size', settings.nodeFontSize)
            .style('fill', settings.nodeColor)
            .style('cursor', 'pointer')
            .on('mouseenter', function (d) {
                // Highlight connected links
                link.style('stroke-opacity', l => {
                    if (l.source.data.key === d.data.key || l.target.data.key === d.data.key) {
                        return settings.linkHoverOpacity;
                    }
                    return settings.linkOpacity * 0.3;
                })
                    .style('stroke', l => {
                        if (l.source.data.key === d.data.key || l.target.data.key === d.data.key) {
                            return '#C85A3E'; // Burnt orange for hover
                        }
                        return settings.linkColor;
                    })
                    .style('stroke-width', l => {
                        const baseWidth = getStrokeWidth(l.source.data.key, l.target.data.key);
                        if (l.source.data.key === d.data.key || l.target.data.key === d.data.key) {
                            return baseWidth * 1.5; // Make highlighted connections even thicker
                        }
                        return baseWidth;
                    });

                // Highlight node
                d3.select(this)
                    .style('fill', '#C85A3E')
                    .style('font-weight', '600');
            })
            .on('mouseleave', function () {
                // Reset links
                link.style('stroke-opacity', settings.linkOpacity)
                    .style('stroke', settings.linkColor)
                    .style('stroke-width', l => getStrokeWidth(l.source.data.key, l.target.data.key));

                // Reset node
                d3.select(this)
                    .style('fill', settings.nodeColor)
                    .style('font-weight', 'normal');
            })
            .on('click', function (d) {
                // Navigate to skill detail page
                const skillName = d.data.key;
                window.location.href = `skill-detail.html?skill=${encodeURIComponent(skillName)}`;
            });

        console.log('Edge bundling visualization rendered successfully');
    }

    /**
     * Build package hierarchy from flat data
     * @param {Array} classes - Array of skill objects with imports
     * @returns {Object} D3 hierarchy
     */
    packageHierarchy(classes) {
        const map = {};

        function find(name, data) {
            let node = map[name];
            if (!node) {
                node = map[name] = data || { name: name, children: [] };
                if (name.length) {
                    node.parent = find('');
                    node.parent.children.push(node);
                    node.key = name;
                }
            }
            return node;
        }

        classes.forEach(d => {
            find(d.name, d);
        });

        return d3.hierarchy(map['']);
    }

    /**
     * Return list of imports for the given array of nodes
     * @param {Array} nodes - Array of D3 nodes
     * @returns {Array} Array of import paths
     */
    packageImports(nodes) {
        const map = {};
        const imports = [];

        // Create map from name to node
        nodes.forEach(d => {
            map[d.data.name] = d;
        });

        // For each import, construct a link from source to target
        nodes.forEach(d => {
            if (d.data.imports && d.data.imports.length > 0) {
                d.data.imports.forEach(i => {
                    if (map[i]) {
                        imports.push(map[d.data.name].path(map[i]));
                    }
                });
            }
        });

        return imports;
    }
}

// Export for use in other scripts
if (typeof window !== 'undefined') {
    window.EdgeBundlingProcessor = EdgeBundlingProcessor;
}
