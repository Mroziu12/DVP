// Word Cloud Processor for Skill Detail Page
// Processes Jaccard Index data to create word cloud visualizations

class WordCloudProcessor {
    constructor() {
        this.jaccardData = null;
        this.languageSkills = ['English', 'Polish', 'German', 'French', 'Spanish', 'Italian'];
    }

    /**
     * Load Jaccard Index data from window object
     */
    loadData() {
        if (typeof window.JACCARD_DATA === 'undefined') {
            throw new Error('Jaccard data not loaded. Make sure jaccardData.js is included.');
        }
        this.jaccardData = window.JACCARD_DATA;
        console.log(`Loaded ${this.jaccardData.length} Jaccard index pairs`);
    }

    /**
     * Get related technologies for a specific skill
     * @param {string} skillName - Name of the skill to find relationships for
     * @param {number} maxWords - Maximum number of words to return
     * @param {number} minJaccard - Minimum Jaccard index threshold
     * @returns {Promise<Array>} Array of {technology, jaccardIndex, coOccurrenceCount, size, x, y}
     */
    async getRelatedTechnologies(skillName, maxWords = 30, minJaccard = 0.01) {
        if (!this.jaccardData) {
            this.loadData();
        }

        // Find all pairs containing the skill
        const relatedPairs = this.jaccardData
            .filter(pair => {
                const tech1Match = pair.tech1.toLowerCase() === skillName.toLowerCase();
                const tech2Match = pair.tech2.toLowerCase() === skillName.toLowerCase();
                return (tech1Match || tech2Match) && pair.jaccardIndex >= minJaccard;
            })
            .map(pair => {
                const istech1 = pair.tech1.toLowerCase() === skillName.toLowerCase();
                return {
                    technology: istech1 ? pair.tech2 : pair.tech1,
                    jaccardIndex: pair.jaccardIndex,
                    coOccurrenceCount: pair.coOccurrenceCount,
                    techCount: istech1 ? pair.tech2Count : pair.tech1Count
                };
            });

        // Filter out language skills and the skill itself
        const filtered = relatedPairs.filter(item =>
            !this.languageSkills.includes(item.technology) &&
            item.technology.toLowerCase() !== skillName.toLowerCase()
        );

        // Sort by Jaccard index (descending) and take top N
        const topTechnologies = filtered
            .sort((a, b) => b.jaccardIndex - a.jaccardIndex)
            .slice(0, maxWords);

        // Calculate sizes and positions
        return await this.calculateWordSizesAndPositions(topTechnologies);
    }

    /**
     * Calculate font sizes based on Jaccard index
     * @param {Array} technologies - Array of technology objects
     * @returns {Promise<Array>} Technologies with size and position properties
     */
    async calculateWordSizesAndPositions(technologies) {
        if (technologies.length === 0) return [];

        // Find min and max Jaccard indices
        const jaccardValues = technologies.map(t => t.jaccardIndex);
        const minJaccard = Math.min(...jaccardValues);
        const maxJaccard = Math.max(...jaccardValues);

        // Define size range (in pixels) - increased for bigger cloud
        const minSize = 18;
        const maxSize = 60;

        // Calculate sizes
        const withSizes = technologies.map(tech => {
            // Normalize Jaccard index to 0-1 range
            const normalized = (tech.jaccardIndex - minJaccard) / (maxJaccard - minJaccard || 1);

            // Apply power scaling for better visual distribution (square root makes differences more visible)
            const scaled = Math.sqrt(normalized);

            // Map to size range
            const size = minSize + (scaled * (maxSize - minSize));

            return {
                ...tech,
                size: Math.round(size)
            };
        });

        // Calculate positions using D3 cloud layout
        return await this.positionWords(withSizes);
    }

    /**
     * Position words using D3 cloud layout to avoid overlaps
     * @param {Array} words - Array of word objects with size
     * @returns {Promise<Array>} Promise that resolves to words with x, y positions added
     */
    positionWords(words) {
        return new Promise((resolve) => {
            // D3 cloud layout requires this format
            const cloudWords = words.map(word => ({
                text: word.technology,
                size: word.size,
                jaccardIndex: word.jaccardIndex,
                coOccurrenceCount: word.coOccurrenceCount,
                techCount: word.techCount
            }));

            const layout = d3.layout.cloud()
                .size([1000, 600]) // Increased container size
                .words(cloudWords)
                .padding(8) // Increased padding for larger words
                .rotate(() => 0) // No rotation
                .font('Crimson Pro')
                .fontSize(d => d.size)
                .on('end', (positionedWords) => {
                    // Convert D3 positions to our format (percentages)
                    const result = positionedWords.map(word => ({
                        technology: word.text,
                        jaccardIndex: word.jaccardIndex,
                        coOccurrenceCount: word.coOccurrenceCount,
                        techCount: word.techCount,
                        size: word.size,
                        // Convert from center-based coordinates to percentage
                        x: ((word.x + 500) / 1000) * 100,
                        y: ((word.y + 300) / 600) * 100
                    }));
                    resolve(result);
                });

            layout.start();
        });
    }

    /**
     * Get color for a word based on its Jaccard index
     * @param {number} jaccardIndex - Jaccard index value
     * @returns {string} CSS color string
     */
    getWordColor(jaccardIndex) {
        // Color scale from light to dark based on strength
        if (jaccardIndex >= 0.3) {
            return '#C85A3E'; // Burnt Orange - very strong relationship
        } else if (jaccardIndex >= 0.15) {
            return '#3A4D39'; // Deep Moss Green - strong relationship
        } else if (jaccardIndex >= 0.08) {
            return '#2B2B2B'; // Matte Carbon - moderate relationship
        } else {
            return '#8B7355'; // Lighter brown - weak relationship
        }
    }

    /**
     * Format Jaccard index for display
     * @param {number} jaccardIndex - Jaccard index value
     * @returns {string} Formatted string
     */
    formatJaccardIndex(jaccardIndex) {
        return (jaccardIndex * 100).toFixed(1) + '%';
    }
}

// Make available globally
window.WordCloudProcessor = WordCloudProcessor;
