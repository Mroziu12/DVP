/**
 * Calculate Boxplot Statistics for Skill Level vs Salary
 * 
 * This script processes ClearOffers.json to calculate boxplot statistics
 * (min, Q1, median, Q3, max) for salary distribution across different skill levels.
 * 
 * Usage: node calculateBoxplotData.js
 * Output: boxplotData.js (JavaScript file with data embedded)
 */

const fs = require('fs');
const path = require('path');

// Read the ClearOffers.json file
const offersPath = path.join(__dirname, 'ClearOffers.json');
const offers = JSON.parse(fs.readFileSync(offersPath, 'utf8'));

console.log(`Loaded ${offers.length} offers from ClearOffers.json`);

/**
 * Calculate quartiles for an array of numbers
 * @param {number[]} sortedArray - Sorted array of numbers
 * @returns {Object} Object containing min, q1, median, q3, max, whiskerMin, whiskerMax, outliers
 */
function calculateQuartiles(sortedArray) {
    if (sortedArray.length === 0) {
        return { min: 0, q1: 0, median: 0, q3: 0, max: 0, whiskerMin: 0, whiskerMax: 0, outliers: [], count: 0 };
    }

    const min = sortedArray[0];
    const max = sortedArray[sortedArray.length - 1];
    const median = getPercentile(sortedArray, 50);
    const q1 = getPercentile(sortedArray, 25);
    const q3 = getPercentile(sortedArray, 75);

    // Calculate IQR and whisker limits
    const iqr = q3 - q1;
    const whiskerLowerLimit = q1 - 1.5 * iqr;
    const whiskerUpperLimit = q3 + 1.5 * iqr;

    // Find actual whisker positions (furthest points within limits)
    let whiskerMin = q1;
    let whiskerMax = q3;
    const outliers = [];

    sortedArray.forEach(value => {
        if (value < whiskerLowerLimit || value > whiskerUpperLimit) {
            // This is an outlier
            outliers.push(value);
        } else {
            // Update whisker positions
            if (value < whiskerMin) whiskerMin = value;
            if (value > whiskerMax) whiskerMax = value;
        }
    });

    return {
        min: Math.round(min * 100) / 100,
        q1: Math.round(q1 * 100) / 100,
        median: Math.round(median * 100) / 100,
        q3: Math.round(q3 * 100) / 100,
        max: Math.round(max * 100) / 100,
        whiskerMin: Math.round(whiskerMin * 100) / 100,
        whiskerMax: Math.round(whiskerMax * 100) / 100,
        outliers: outliers.map(v => Math.round(v * 100) / 100),
        count: sortedArray.length
    };
}

/**
 * Get percentile value from sorted array
 * @param {number[]} sortedArray - Sorted array of numbers
 * @param {number} percentile - Percentile to calculate (0-100)
 * @returns {number} Percentile value
 */
function getPercentile(sortedArray, percentile) {
    const index = (percentile / 100) * (sortedArray.length - 1);
    const lower = Math.floor(index);
    const upper = Math.ceil(index);
    const weight = index - lower;

    if (lower === upper) {
        return sortedArray[lower];
    }

    return sortedArray[lower] * (1 - weight) + sortedArray[upper] * weight;
}

/**
 * Process offers for a specific skill and calculate boxplot data
 * @param {string} skillName - Name of the skill to filter by
 * @returns {Object} Boxplot data grouped by skill level
 */
function calculateBoxplotDataForSkill(skillName) {
    console.log(`\nProcessing skill: ${skillName}`);

    // Group salaries by skill level for this specific skill
    const salaryByLevel = {
        1: [],
        2: [],
        3: [],
        4: [],
        5: []
    };

    // Process each offer
    offers.forEach(offer => {
        // Skip offers without salary
        if (!offer.salary_eur || offer.salary_eur <= 0) {
            return;
        }

        // Check if this offer requires the specified skill
        if (!offer.skills || !Array.isArray(offer.skills)) {
            return;
        }

        // Find the skill in this offer
        const skill = offer.skills.find(s =>
            s.name && s.name.toLowerCase() === skillName.toLowerCase()
        );

        if (skill && skill.level >= 1 && skill.level <= 5) {
            salaryByLevel[skill.level].push(offer.salary_eur);
        }
    });

    // Calculate statistics for each level
    const boxplotData = {};

    for (let level = 1; level <= 5; level++) {
        let salaries = salaryByLevel[level];

        if (salaries.length > 0) {
            // Sort salaries
            salaries.sort((a, b) => a - b);

            // Filter out extreme outliers (above 95th percentile) to prevent chart distortion
            // Only apply if we have enough data points
            if (salaries.length >= 10) {
                const p95 = getPercentile(salaries, 95);
                salaries = salaries.filter(s => s <= p95);
            }

            // Calculate quartiles on filtered data
            const stats = calculateQuartiles(salaries);

            boxplotData[level] = stats;

            console.log(`Level ${level}: ${stats.count} offers, median: €${stats.median}`);
        } else {
            console.log(`Level ${level}: No data`);
        }
    }

    return boxplotData;
}

/**
 * Calculate boxplot data for all skills
 * @returns {Object} Boxplot data for all skills
 */
function calculateAllBoxplotData() {
    console.log('\n=== Calculating Boxplot Data for All Skills ===\n');

    // Get unique skill names
    const skillSet = new Set();

    offers.forEach(offer => {
        if (offer.skills && Array.isArray(offer.skills)) {
            offer.skills.forEach(skill => {
                if (skill.name) {
                    skillSet.add(skill.name);
                }
            });
        }
    });

    const allSkills = Array.from(skillSet).sort();
    console.log(`Found ${allSkills.length} unique skills`);

    // Calculate boxplot data for each skill
    const allBoxplotData = {};

    allSkills.forEach(skillName => {
        const boxplotData = calculateBoxplotDataForSkill(skillName);

        // Only include skills that have data for at least one level
        if (Object.keys(boxplotData).length > 0) {
            allBoxplotData[skillName] = boxplotData;
        }
    });

    console.log(`\nGenerated boxplot data for ${Object.keys(allBoxplotData).length} skills`);

    return allBoxplotData;
}

// Main execution
console.log('=== Boxplot Data Calculator ===\n');

const allBoxplotData = calculateAllBoxplotData();

// Write to JavaScript file for browser usage
const outputPath = path.join(__dirname, 'boxplotData.js');
const jsContent = `// Auto-generated boxplot data
// Generated on: ${new Date().toISOString()}
// Format: { skillName: { level: { min, q1, median, q3, max, count } } }

const BOXPLOT_DATA = ${JSON.stringify(allBoxplotData, null, 2)};

// Export for use in browser
if (typeof window !== 'undefined') {
    window.BOXPLOT_DATA = BOXPLOT_DATA;
}

// Export for Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BOXPLOT_DATA;
}
`;

fs.writeFileSync(outputPath, jsContent, 'utf8');

console.log(`\n✓ Boxplot data written to: ${outputPath}`);
console.log(`✓ Total skills with data: ${Object.keys(allBoxplotData).length}`);

// Print sample data for verification
const sampleSkills = Object.keys(allBoxplotData).slice(0, 3);
console.log('\n=== Sample Data ===');
sampleSkills.forEach(skill => {
    console.log(`\n${skill}:`);
    console.log(JSON.stringify(allBoxplotData[skill], null, 2));
});
