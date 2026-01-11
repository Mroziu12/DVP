const fs = require('fs');
const path = require('path');

/**
 * Process ClearOffers.json to extract work mode distribution
 * for pie chart visualization.
 * 
 * Work modes: Remote, Office, Hybrid, etc.
 */

function processWorkMode() {
    try {
        // Read the ClearOffers.json file
        const dataPath = path.join(__dirname, '..', 'ClearOffers2.json');
        const rawData = fs.readFileSync(dataPath, 'utf8');
        const offers = JSON.parse(rawData);

        // Initialize counters (dynamic - will add modes as we find them)
        const workModeCounts = {};

        // Process each offer
        offers.forEach(offer => {
            let mode = offer.work_mode;

            // Handle null/undefined/empty values
            if (!mode || mode.trim() === '') {
                mode = 'Unknown';
            }

            // Normalize the mode name (capitalize first letter of each word)
            const normalizedMode = mode
                .split(' ')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                .join(' ');

            // Increment counter
            if (workModeCounts[normalizedMode]) {
                workModeCounts[normalizedMode]++;
            } else {
                workModeCounts[normalizedMode] = 1;
            }
        });

        // Convert to pie chart format
        const pieChartData = Object.entries(workModeCounts)
            .map(([label, value]) => ({
                label,
                value
            }))
            .sort((a, b) => b.value - a.value); // Sort by value descending

        // Calculate percentages
        const total = offers.length;
        const dataWithPercentages = pieChartData.map(item => ({
            ...item,
            percentage: ((item.value / total) * 100).toFixed(2)
        }));

        // Output results
        console.log('\n=== Work Mode Distribution ===');
        console.log(`Total offers analyzed: ${total}`);
        console.log('\nBreakdown:');
        dataWithPercentages.forEach(item => {
            console.log(`  ${item.label}: ${item.value} (${item.percentage}%)`);
        });
        console.log('\n=== Pie Chart Data ===');
        console.log(JSON.stringify(pieChartData, null, 2));

        return pieChartData;

    } catch (error) {
        console.error('Error processing work mode data:', error.message);
        throw error;
    }
}

// Run the processor if executed directly
if (require.main === module) {
    processWorkMode();
}

// Export for use in other modules
module.exports = processWorkMode;
