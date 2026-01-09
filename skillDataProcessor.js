/**
 * Skill Data Processor
 * 
 * Processes ClearOffers.json to extract skill-specific data for pie charts.
 * Filters job offers by a specific skill and provides distribution data.
 */

class SkillDataProcessor {
    constructor() {
        this.offers = [];
        this.loaded = false;
    }

    /**
     * Load ClearOffers.json data
     */
    async loadData() {
        if (this.loaded) return;

        try {
            const response = await fetch('./ClearOffers.json');
            this.offers = await response.json();
            this.loaded = true;
            console.log(`Loaded ${this.offers.length} job offers`);
        } catch (error) {
            console.error('Error loading ClearOffers.json:', error);
            throw error;
        }
    }

    /**
     * Filter offers by skill name
     * @param {string} skillName - The skill to filter by
     * @returns {Array} Filtered offers containing the skill
     */
    filterBySkill(skillName) {
        if (!skillName) return [];

        const normalizedSkillName = skillName.toLowerCase().trim();

        return this.offers.filter(offer => {
            if (!offer.skills || !Array.isArray(offer.skills)) return false;

            return offer.skills.some(skill => {
                const offerSkillName = (skill.name || skill.original_name || '').toLowerCase().trim();
                return offerSkillName === normalizedSkillName;
            });
        });
    }

    /**
     * Get experience level distribution for a specific skill
     * @param {string} skillName - The skill to analyze
     * @returns {Array} Experience level data for pie chart
     */
    getExperienceLevelData(skillName) {
        const filteredOffers = this.filterBySkill(skillName);

        if (filteredOffers.length === 0) {
            return [];
        }

        const experienceCounts = {
            'Junior': 0,
            'Mid': 0,
            'Senior': 0,
            'Lead': 0
        };

        filteredOffers.forEach(offer => {
            let level = offer.experience_level;

            // Treat "unknown" as "Lead"
            if (!level || level.toLowerCase() === 'unknown') {
                level = 'Lead';
            }

            // Normalize the level name
            const normalizedLevel = level.charAt(0).toUpperCase() + level.slice(1).toLowerCase();

            if (experienceCounts.hasOwnProperty(normalizedLevel)) {
                experienceCounts[normalizedLevel]++;
            } else {
                experienceCounts['Lead']++;
            }
        });

        const total = filteredOffers.length;

        return Object.entries(experienceCounts)
            .filter(([_, value]) => value > 0)
            .map(([label, value]) => ({
                label,
                value,
                percentage: ((value / total) * 100).toFixed(1)
            }));
    }

    /**
     * Get work mode distribution for a specific skill
     * @param {string} skillName - The skill to analyze
     * @returns {Array} Work mode data for pie chart
     */
    getWorkModeData(skillName) {
        const filteredOffers = this.filterBySkill(skillName);

        if (filteredOffers.length === 0) {
            return [];
        }

        const workModeCounts = {};

        filteredOffers.forEach(offer => {
            let mode = offer.work_mode;

            if (!mode || mode.trim() === '') {
                mode = 'Unknown';
            }

            // Normalize the mode name
            const normalizedMode = mode
                .split(' ')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                .join(' ');

            workModeCounts[normalizedMode] = (workModeCounts[normalizedMode] || 0) + 1;
        });

        const total = filteredOffers.length;

        return Object.entries(workModeCounts)
            .map(([label, value]) => ({
                label,
                value,
                percentage: ((value / total) * 100).toFixed(1)
            }))
            .sort((a, b) => b.value - a.value);
    }

    /**
     * Get contract type distribution for a specific skill
     * @param {string} skillName - The skill to analyze
     * @returns {Array} Contract type data for pie chart
     */
    getContractTypeData(skillName) {
        const filteredOffers = this.filterBySkill(skillName);

        if (filteredOffers.length === 0) {
            return [];
        }

        const contractTypeCounts = {};

        filteredOffers.forEach(offer => {
            let contractType = offer.contract_type;

            if (!contractType || contractType.trim() === '') {
                contractType = 'Unknown';
            }

            const normalizedType = contractType.trim();
            contractTypeCounts[normalizedType] = (contractTypeCounts[normalizedType] || 0) + 1;
        });

        const total = filteredOffers.length;

        return Object.entries(contractTypeCounts)
            .map(([label, value]) => ({
                label,
                value,
                percentage: ((value / total) * 100).toFixed(1)
            }))
            .sort((a, b) => b.value - a.value);
    }

    /**
     * Get total count of offers for a skill
     * @param {string} skillName - The skill to count
     * @returns {number} Total number of offers
     */
    getOfferCount(skillName) {
        return this.filterBySkill(skillName).length;
    }
}

// Export for use in other scripts
window.SkillDataProcessor = SkillDataProcessor;
