const fs = require('fs');
const path = require('path');

/**
 * Process ClearOffers.json to extract experience level distribution
 * for pie chart visualization.
 * 
 * Experience levels: Junior, Mid, Senior, Lead
 * Note: "unknown" values are treated as "Lead"
 */

function processExperienceLevel() {
    try {
        // Read the ClearOffers.json file
        const dataPath = path.join(__dirname, '..', 'ClearOffers.json');
        const rawData = fs.readFileSync(dataPath, 'utf8');
        const offers = JSON.parse(rawData);

        // Initialize counters
        const experienceCounts = {
            'Junior': 0,
            'Mid': 0,
            'Senior': 0,
            'Lead': 0
        };

        // Process each offer
        offers.forEach(offer => {
            let level = offer.experience_level;

            // Treat "unknown" as "Lead"
            if (!level || level.toLowerCase() === 'unknown') {
                level = 'Lead';
            }

            // Normalize the level name (capitalize first letter)
            const normalizedLevel = level.charAt(0).toUpperCase() + level.slice(1).toLowerCase();

            // Increment counter if it's a valid level
            if (experienceCounts.hasOwnProperty(normalizedLevel)) {
                experienceCounts[normalizedLevel]++;
            } else {
                // If we encounter an unexpected level, log it and count as Lead
                console.warn(`Unexpected experience level: "${level}" - treating as Lead`);
                experienceCounts['Lead']++;
            }
        });

        // Convert to pie chart format
        const pieChartData = Object.entries(experienceCounts).map(([label, value]) => ({
            label,
            value
        }));

        // Calculate percentages
        const total = offers.length;
        const dataWithPercentages = pieChartData.map(item => ({
            ...item,
            percentage: ((item.value / total) * 100).toFixed(2)
        }));

        // Output results
        console.log('\n=== Experience Level Distribution ===');
        console.log(`Total offers analyzed: ${total}`);
        console.log('\nBreakdown:');
        dataWithPercentages.forEach(item => {
            console.log(`  ${item.label}: ${item.value} (${item.percentage}%)`);
        });
        console.log('\n=== Pie Chart Data ===');
        console.log(JSON.stringify(pieChartData, null, 2));

        return pieChartData;

    } catch (error) {
        console.error('Error processing experience level data:', error.message);
        throw error;
    }
}

// Run the processor if executed directly
if (require.main === module) {
    processExperienceLevel();
}

// Export for use in other modules
module.exports = processExperienceLevel;
