const fs = require('fs');
const path = require('path');

/**
 * Process ClearOffers.json to extract contract type distribution
 * for pie chart visualization.
 * 
 * Contract types: B2B, UoP (Umowa o Pracę), UZ (Umowa Zlecenie), etc.
 */

function processContractType() {
    try {
        // Read the ClearOffers.json file
        const dataPath = path.join(__dirname, '..', 'ClearOffers2.json');
        const rawData = fs.readFileSync(dataPath, 'utf8');
        const offers = JSON.parse(rawData);

        // Initialize counters (dynamic - will add types as we find them)
        const contractTypeCounts = {};

        // Process each offer
        offers.forEach(offer => {
            let contractType = offer.contract_type;

            // Handle null/undefined/empty values
            if (!contractType || contractType.trim() === '') {
                contractType = 'Unknown';
            }

            // Keep the original format (e.g., "B2B", "UoP") without normalization
            // since contract types are often abbreviations
            const normalizedType = contractType.trim();

            // Increment counter
            if (contractTypeCounts[normalizedType]) {
                contractTypeCounts[normalizedType]++;
            } else {
                contractTypeCounts[normalizedType] = 1;
            }
        });

        // Convert to pie chart format
        const pieChartData = Object.entries(contractTypeCounts)
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
        console.log('\n=== Contract Type Distribution ===');
        console.log(`Total offers analyzed: ${total}`);
        console.log('\nBreakdown:');
        dataWithPercentages.forEach(item => {
            console.log(`  ${item.label}: ${item.value} (${item.percentage}%)`);
        });
        console.log('\n=== Pie Chart Data ===');
        console.log(JSON.stringify(pieChartData, null, 2));

        return pieChartData;

    } catch (error) {
        console.error('Error processing contract type data:', error.message);
        throw error;
    }
}

// Run the processor if executed directly
if (require.main === module) {
    processContractType();
}

// Export for use in other modules
module.exports = processContractType;
