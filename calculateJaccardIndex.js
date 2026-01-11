// Calculate Jaccard Index for technology co-occurrences
// This script analyzes which technologies appear together in job offers

// Import the data
const fs = require('fs');
const clearOffersData = JSON.parse(fs.readFileSync('./ClearOffers2.json', 'utf8'));

/**
 * Calculate Jaccard Index between two sets
 * Jaccard Index = |A ∩ B| / |A ∪ B|
 * @param {Set} setA - First set
 * @param {Set} setB - Second set
 * @returns {number} - Jaccard Index (0 to 1)
 */
function calculateJaccardIndex(setA, setB) {
    const intersection = new Set([...setA].filter(x => setB.has(x)));
    const union = new Set([...setA, ...setB]);

    if (union.size === 0) return 0;
    return intersection.size / union.size;
}

/**
 * Build a map of technology -> set of offer IDs that contain it
 * @param {Array} offers - Array of job offers
 * @returns {Map} - Map of technology name to Set of offer indices
 */
function buildTechnologyOfferMap(offers) {
    const techOfferMap = new Map();

    offers.forEach((offer, index) => {
        if (!offer.skills || !Array.isArray(offer.skills)) return;

        // Get unique skill names from this offer
        const skillNames = new Set(
            offer.skills
                .map(skill => skill.name)
                .filter(name => name && name.trim() !== '')
        );

        // Add this offer index to each technology's set
        skillNames.forEach(skillName => {
            if (!techOfferMap.has(skillName)) {
                techOfferMap.set(skillName, new Set());
            }
            techOfferMap.get(skillName).add(index);
        });
    });

    return techOfferMap;
}

/**
 * Calculate Jaccard Index for all technology pairs
 * @param {Array} offers - Array of job offers
 * @param {number} minOccurrences - Minimum number of occurrences for a technology to be included
 * @returns {Array} - Array of objects with tech1, tech2, jaccardIndex, and co-occurrence count
 */
function calculateAllJaccardIndices(offers, minOccurrences = 5) {
    console.log('Building technology-offer map...');
    const techOfferMap = buildTechnologyOfferMap(offers);

    // Filter technologies by minimum occurrences
    const technologies = Array.from(techOfferMap.entries())
        .filter(([tech, offerSet]) => offerSet.size >= minOccurrences)
        .map(([tech]) => tech)
        .sort();

    console.log(`Found ${technologies.length} technologies with at least ${minOccurrences} occurrences`);
    console.log('Calculating Jaccard indices...');

    const results = [];
    const totalPairs = (technologies.length * (technologies.length - 1)) / 2;
    let processedPairs = 0;

    // Calculate Jaccard index for each pair
    for (let i = 0; i < technologies.length; i++) {
        for (let j = i + 1; j < technologies.length; j++) {
            const tech1 = technologies[i];
            const tech2 = technologies[j];

            const set1 = techOfferMap.get(tech1);
            const set2 = techOfferMap.get(tech2);

            const jaccardIndex = calculateJaccardIndex(set1, set2);

            // Calculate co-occurrence count (intersection size)
            const coOccurrenceCount = [...set1].filter(x => set2.has(x)).length;

            if (jaccardIndex > 0) {
                results.push({
                    tech1,
                    tech2,
                    jaccardIndex: parseFloat(jaccardIndex.toFixed(4)),
                    coOccurrenceCount,
                    tech1Count: set1.size,
                    tech2Count: set2.size
                });
            }

            processedPairs++;
            if (processedPairs % 10000 === 0) {
                console.log(`Processed ${processedPairs}/${totalPairs} pairs (${(processedPairs / totalPairs * 100).toFixed(1)}%)`);
            }
        }
    }

    // Sort by Jaccard index (descending)
    results.sort((a, b) => b.jaccardIndex - a.jaccardIndex);

    console.log(`\nCalculation complete! Found ${results.length} technology pairs with co-occurrences`);

    return results;
}

/**
 * Get top co-occurring technologies for a specific technology
 * @param {Array} jaccardResults - Results from calculateAllJaccardIndices
 * @param {string} technology - Technology name to find co-occurrences for
 * @param {number} topN - Number of top results to return
 * @returns {Array} - Top N co-occurring technologies
 */
function getTopCoOccurrences(jaccardResults, technology, topN = 10) {
    return jaccardResults
        .filter(result =>
            result.tech1.toLowerCase() === technology.toLowerCase() ||
            result.tech2.toLowerCase() === technology.toLowerCase()
        )
        .slice(0, topN)
        .map(result => ({
            technology: result.tech1.toLowerCase() === technology.toLowerCase() ? result.tech2 : result.tech1,
            jaccardIndex: result.jaccardIndex,
            coOccurrenceCount: result.coOccurrenceCount
        }));
}

/**
 * Generate statistics about the Jaccard indices
 * @param {Array} jaccardResults - Results from calculateAllJaccardIndices
 */
function printStatistics(jaccardResults) {
    if (jaccardResults.length === 0) {
        console.log('No results to analyze');
        return;
    }

    const indices = jaccardResults.map(r => r.jaccardIndex);
    const avg = indices.reduce((a, b) => a + b, 0) / indices.length;
    const max = Math.max(...indices);
    const min = Math.min(...indices);

    console.log('\n=== Jaccard Index Statistics ===');
    console.log(`Total pairs: ${jaccardResults.length}`);
    console.log(`Average Jaccard Index: ${avg.toFixed(4)}`);
    console.log(`Max Jaccard Index: ${max.toFixed(4)}`);
    console.log(`Min Jaccard Index: ${min.toFixed(4)}`);

    console.log('\n=== Top 20 Most Similar Technology Pairs ===');
    jaccardResults.slice(0, 20).forEach((result, index) => {
        console.log(`${index + 1}. ${result.tech1} <-> ${result.tech2}`);
        console.log(`   Jaccard: ${result.jaccardIndex}, Co-occurrences: ${result.coOccurrenceCount}, ` +
            `Counts: ${result.tech1Count}, ${result.tech2Count}`);
    });
}

// Main execution
if (require.main === module) {
    console.log('Starting Jaccard Index calculation...\n');

    // You can adjust minOccurrences to filter out rare technologies
    const minOccurrences = 10;

    const jaccardResults = calculateAllJaccardIndices(clearOffersData, minOccurrences);

    // Print statistics
    printStatistics(jaccardResults);

    // Example: Get top co-occurrences for a specific technology
    console.log('\n=== Example: Top co-occurrences for "Python" ===');
    const pythonCoOccurrences = getTopCoOccurrences(jaccardResults, 'Python', 15);
    pythonCoOccurrences.forEach((result, index) => {
        console.log(`${index + 1}. ${result.technology}: Jaccard=${result.jaccardIndex}, Count=${result.coOccurrenceCount}`);
    });

    // Save results to JSON file
    const fs = require('fs');
    const outputPath = './jaccardIndices.json';
    fs.writeFileSync(outputPath, JSON.stringify(jaccardResults, null, 2));
    console.log(`\n✓ Results saved to ${outputPath}`);

    // Also save a summary with technology statistics
    const techOfferMap = buildTechnologyOfferMap(clearOffersData);
    const techStats = Array.from(techOfferMap.entries())
        .filter(([tech, offerSet]) => offerSet.size >= minOccurrences)
        .map(([tech, offerSet]) => ({
            technology: tech,
            occurrences: offerSet.size
        }))
        .sort((a, b) => b.occurrences - a.occurrences);

    const summaryPath = './technologyStats.json';
    fs.writeFileSync(summaryPath, JSON.stringify(techStats, null, 2));
    console.log(`✓ Technology statistics saved to ${summaryPath}`);
}

// Export functions for use in other scripts
module.exports = {
    calculateJaccardIndex,
    buildTechnologyOfferMap,
    calculateAllJaccardIndices,
    getTopCoOccurrences
};
