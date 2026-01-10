# Jaccard Index Analysis for Technology Co-occurrences

## Overview

This analysis calculates the **Jaccard Index** for technology pairs to understand which technologies frequently appear together in job offers. This is crucial for creating an effective word cloud that shows technology relationships.

## What is Jaccard Index?

The Jaccard Index (also known as Jaccard Similarity Coefficient) measures similarity between two sets:

```
Jaccard Index = |A ∩ B| / |A ∪ B|
```

Where:
- `|A ∩ B|` = Number of job offers containing BOTH technologies
- `|A ∪ B|` = Number of job offers containing EITHER technology (or both)

**Range**: 0 to 1
- **0** = No overlap (technologies never appear together)
- **1** = Perfect overlap (technologies always appear together)

## Files Generated

### 1. `jaccardIndices.json`
Contains all technology pairs with their Jaccard indices, sorted by similarity (descending).

**Structure**:
```json
{
  "tech1": "Technology A",
  "tech2": "Technology B",
  "jaccardIndex": 0.5849,
  "coOccurrenceCount": 62,
  "tech1Count": 77,
  "tech2Count": 91
}
```

### 2. `technologyStats.json`
Contains occurrence counts for each technology, sorted by frequency (descending).

**Structure**:
```json
{
  "technology": "Python",
  "occurrences": 512
}
```

## Key Findings

### Top Technology Pairs (Highest Jaccard Index)

1. **BPMN ↔ UML** (0.5849)
   - 62 co-occurrences out of 77 BPMN and 91 UML offers
   - Business modeling tools often used together

2. **Confluence ↔ Jira** (0.5586)
   - 81 co-occurrences
   - Atlassian ecosystem tools

3. **CSS ↔ HTML** (0.5474)
   - 52 co-occurrences
   - Frontend fundamentals

4. **Grafana ↔ Prometheus** (0.5000)
   - Monitoring stack

5. **PyTorch ↔ TensorFlow** (0.5000)
   - ML/AI frameworks

6. **Docker ↔ Kubernetes** (0.3483)
   - Container orchestration

### Most Common Technologies

1. **English** - 1,561 occurrences
2. **Polish** - 740 occurrences
3. **Python** - 512 occurrences
4. **SQL** - 429 occurrences
5. **Azure** - 337 occurrences

### Python Co-occurrences

Top technologies that appear with Python:
1. English (Jaccard: 0.201, Count: 347)
2. SQL (Jaccard: 0.191, Count: 151)
3. AWS (Jaccard: 0.164, Count: 113)
4. AI (Jaccard: 0.133, Count: 76)
5. Docker (Jaccard: 0.122, Count: 81)

## How to Use This for Word Cloud

### Option 1: Size by Frequency
Use `technologyStats.json` to size words by how often they appear:
- Larger words = More job offers
- Filter out languages (English, Polish) if desired

### Option 2: Size by Co-occurrence Strength
For a specific technology (e.g., Python):
1. Filter `jaccardIndices.json` for pairs containing "Python"
2. Size related technologies by their Jaccard Index
3. This shows which technologies are most closely associated

### Option 3: Cluster by Similarity
Group technologies with high Jaccard indices:
- **Frontend**: CSS, HTML, JavaScript, React, TypeScript
- **DevOps**: Docker, Kubernetes, Terraform, AWS, Azure
- **AI/ML**: Python, LLM, RAG, TensorFlow, PyTorch
- **Project Management**: Jira, Confluence, Agile, Scrum

## Script Usage

### Run the Analysis
```bash
node calculateJaccardIndex.js
```

### Customize Minimum Occurrences
Edit `calculateJaccardIndex.js` and change:
```javascript
const minOccurrences = 10; // Adjust this value
```

### Get Co-occurrences for Specific Technology
```javascript
const { getTopCoOccurrences } = require('./calculateJaccardIndex.js');
const fs = require('fs');

const jaccardResults = JSON.parse(fs.readFileSync('./jaccardIndices.json', 'utf8'));
const pythonCoOccurrences = getTopCoOccurrences(jaccardResults, 'Python', 20);
console.log(pythonCoOccurrences);
```

## Statistics Summary

- **Total technology pairs analyzed**: 5,092
- **Technologies with ≥10 occurrences**: 199
- **Average Jaccard Index**: 0.0283
- **Maximum Jaccard Index**: 0.5849 (BPMN ↔ UML)
- **Minimum Jaccard Index**: 0.0006

## Interpretation Guidelines

### Jaccard Index Ranges

- **0.5 - 1.0**: Very strong association
  - Technologies almost always appear together
  - Example: CSS & HTML, Confluence & Jira

- **0.3 - 0.5**: Strong association
  - Technologies frequently appear together
  - Example: Docker & Kubernetes, .NET & C#

- **0.1 - 0.3**: Moderate association
  - Technologies sometimes appear together
  - Example: Python & SQL, React & TypeScript

- **0.0 - 0.1**: Weak association
  - Technologies rarely appear together
  - May indicate different domains/specializations

## Next Steps for Word Cloud

1. **Filter Technologies**
   - Remove languages (English, Polish, German)
   - Remove soft skills if desired
   - Focus on technical skills

2. **Choose Visualization Strategy**
   - **Frequency-based**: Size by occurrence count
   - **Relationship-based**: Size by Jaccard index for a focal technology
   - **Cluster-based**: Group similar technologies together

3. **Color Coding**
   - Group by category (Frontend, Backend, DevOps, AI/ML, etc.)
   - Use Jaccard index to determine color intensity

4. **Interactive Features**
   - Click on a technology to highlight related technologies
   - Show Jaccard index on hover
   - Filter by minimum co-occurrence count

## Example: Creating a Python-Centric Word Cloud

```javascript
// Get all technologies that co-occur with Python
const pythonRelated = jaccardResults
  .filter(r => r.tech1 === 'Python' || r.tech2 === 'Python')
  .map(r => ({
    technology: r.tech1 === 'Python' ? r.tech2 : r.tech1,
    similarity: r.jaccardIndex,
    count: r.coOccurrenceCount
  }))
  .sort((a, b) => b.similarity - a.similarity);

// Use similarity for size, count for color intensity
```

This data provides a solid foundation for understanding technology relationships in the job market!
