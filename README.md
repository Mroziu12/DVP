# Job Market Analytics - Skill Detail Page

## Running the Application

Due to browser security restrictions (CORS), the skill detail page cannot load `ClearOffers.json` when opened directly as a file (`file://` protocol). You need to run a local web server.

### Option 1: Using Python (Recommended)

If you have Python installed:

```bash
# Navigate to the project directory
cd c:\Users\mmroz\DVP\job-market-page

# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000
```

Then open: `http://localhost:8000/index.html`

### Option 2: Using Node.js

If you have Node.js installed:

```bash
# Install http-server globally (one-time)
npm install -g http-server

# Navigate to the project directory
cd c:\Users\mmroz\DVP\job-market-page

# Start the server
http-server -p 8000
```

Then open: `http://localhost:8000/index.html`

### Option 3: Using npx (No Installation)

```bash
# Navigate to the project directory
cd c:\Users\mmroz\DVP\job-market-page

# Run server without installing
npx serve -p 8000
```

Then open: `http://localhost:8000/index.html`

### Option 4: VS Code Live Server Extension

1. Install the "Live Server" extension in VS Code
2. Right-click on `index.html`
3. Select "Open with Live Server"

## How It Works

1. **Main Page** (`index.html`): Displays skill bubbles
2. **Skill Detail Page** (`skill-detail.html`): Shows detailed analytics for a specific skill
3. **Data Processing**: 
   - `skillDataProcessor.js` - Filters `ClearOffers.json` by skill
   - `skill-detail.js` - Renders three pie charts with filtered data

## Pie Charts

The skill detail page displays three pie charts:

1. **Contract Type** - Distribution of B2B, UoP, etc.
2. **Work Mode** - Remote vs Hybrid vs Office
3. **Experience Level** - Junior/Mid/Senior/Lead (unknown treated as Lead)

All data is filtered to show only job offers that require the selected skill.

## Files

- `main.js` - Main page interactions
- `skill-detail.js` - Skill detail page with chart rendering
- `skillDataProcessor.js` - Data filtering and processing
- `processExperienceLevel.js` - Standalone processor for experience data
- `processWorkMode.js` - Standalone processor for work mode data
- `processContractType.js` - Standalone processor for contract type data
