const fs = require('fs');
const path = require('path');
const DatasetAnalyzer = require('./datasetAnalyzer');

class NewsAnalyzer {
  constructor() {
    this.knownFacts = [];
    this.analysisHistory = [];
    this.datasetAnalyzer = new DatasetAnalyzer();
    this.loadDatasets();
    this.datasetAnalyzer.printSummary();
  }

  loadDatasets() {
    try {
      // Load known facts
      const factsPath = path.join(__dirname, 'analysis', 'known_facts.json');
      if (fs.existsSync(factsPath)) {
        const factsData = fs.readFileSync(factsPath, 'utf8');
        this.knownFacts = JSON.parse(factsData);
      }
    } catch (error) {
      console.error('Error loading datasets:', error.message);
    }
  }

  // Calculate similarity between two strings (Levenshtein distance based)
  calculateSimilarity(str1, str2) {
    const s1 = str1.toLowerCase();
    const s2 = str2.toLowerCase();
    
    // Split into words and check word overlap
    const words1 = s1.split(/\s+/);
    const words2 = s2.split(/\s+/);
    
    let matches = 0;
    for (const word of words1) {
      if (word.length > 3 && words2.some(w => w.includes(word) || word.includes(w))) {
        matches++;
      }
    }
    
    return matches / Math.max(words1.length, words2.length);
  }

  // Analyze claim against known facts
  analyzeAgainstDataset(claim) {
    let bestMatch = null;
    let bestSimilarity = 0.5; // Minimum threshold

    for (const fact of this.knownFacts) {
      const similarity = this.calculateSimilarity(claim, fact.text);
      
      if (similarity > bestSimilarity) {
        bestSimilarity = similarity;
        
        // Special handling for specific claims
        const claimLower = claim.toLowerCase();
        const factLower = fact.text.toLowerCase();
        
        // Check for pole accuracy in Chandrayaan-3
        if (factLower.includes('chandrayaan') && claimLower.includes('chandrayaan')) {
          if (factLower.includes('south pole') && !claimLower.includes('south')) {
            bestMatch = {
              claim: claim,
              verdict: 'FAKE',
              confidence: 0.95,
              reason: 'Incorrect detail: Chandrayaan-3 landed on the SOUTH POLE, not north pole.',
              source_type: 'verified-dataset',
              tags: ['location-error', 'moon-landing', 'ISRO', 'verified'],
              sources: fact.sources || ['ISRO'],
              matched_fact: fact.text,
              similarity: similarity
            };
            continue;
          }
        }
        
        // General match
        bestMatch = {
          claim: claim,
          verdict: fact.verdict,
          confidence: fact.confidence,
          reason: fact.reason,
          source_type: 'verified-dataset',
          tags: fact.tags || [],
          sources: fact.sources ? fact.sources.map(s => typeof s === 'string' ? s : s.source) : [],
          matched_fact: fact.text,
          similarity: similarity
        };
      }
    }

    return bestMatch;
  }

  // Apply custom fact-checking rules (comprehensive, 20+ categories)
  applyCustomRules(claim) {
    const lower = claim.toLowerCase();
    let verdict = null;
    let confidence = 0;
    let reason = '';
    let tags = [];

    // ============ ASTRONOMY/SPACE (1-4) ============
    if ((lower.includes('sun') || lower.includes('sunrise')) && lower.includes('east') && 
        (lower.includes('rise') || lower.includes('raises') || lower.includes('raise') || lower.includes('rising') || lower.includes('comes'))) {
      verdict = 'REAL';
      confidence = 0.99;
      reason = 'Scientifically verified: The sun rises in the east due to Earth\'s rotation on its axis (counterclockwise when viewed from north pole)';
      tags = ['astronomy', 'science', 'verified'];
    }
    else if ((lower.includes('sun') || lower.includes('sunrise')) && lower.includes('west') && 
             (lower.includes('rise') || lower.includes('raises') || lower.includes('raise') || lower.includes('rising'))) {
      verdict = 'FAKE';
      confidence = 0.99;
      reason = 'INCORRECT: The sun rises in the EAST, not west. The sun SETS in the west. Basic astronomy fact proven by Earth\'s rotation.';
      tags = ['astronomy', 'science', 'false', 'common-error'];
    }
    else if ((lower.includes('sun') || lower.includes('sunset')) && lower.includes('west') && 
             (lower.includes('set') || lower.includes('sets') || lower.includes('setting'))) {
      verdict = 'REAL';
      confidence = 0.99;
      reason = 'Scientifically verified: The sun sets in the west as Earth rotates eastward';
      tags = ['astronomy', 'science', 'verified'];
    }
    else if ((lower.includes('moon') || lower.includes('lunar')) && lower.includes('landing') && 
             (lower.includes('fake') || lower.includes('hoax') || lower.includes('never') || lower.includes('conspiracy'))) {
      verdict = 'FAKE';
      confidence = 0.99;
      reason = 'FALSE: Moon landings are REAL and well-documented (Apollo 11 in 1969, Apollo 12-17). Physical evidence, thousands of witnesses, independent verification from other countries.';
      tags = ['history', 'space', 'conspiracy', 'debunked', 'apollo'];
    }
    else if ((lower.includes('chandrayaan') || lower.includes('chandrayaan-3')) && 
             (lower.includes('moon') || lower.includes('lunar')) && 
             (lower.includes('landing') || lower.includes('landed') || lower.includes('south pole'))) {
      verdict = 'REAL';
      confidence = 0.99;
      reason = 'Verified: Chandrayaan-3 successfully landed on the moon\'s SOUTH POLE on August 23, 2023 (ISRO official confirmation)';
      tags = ['space', 'ISRO', 'moon', 'verified', 'india'];
    }

    // ============ EARTH/GEOGRAPHY (5-7) ============
    else if ((lower.includes('earth') || lower.includes('world') || lower.includes('planet')) && lower.includes('flat')) {
      verdict = 'FAKE';
      confidence = 0.99;
      reason = 'FALSE CONSPIRACY: Earth is spherical (oblate spheroid), proven by physics, satellite imagery, NASA observations, circumnavigation, gravity, and basic geometry. No credible evidence supports flat Earth.';
      tags = ['geography', 'science', 'conspiracy', 'debunked', 'false-belief'];
    }
    else if ((lower.includes('earth') || lower.includes('world') || lower.includes('planet')) && 
             (lower.includes('spherical') || lower.includes('sphere') || lower.includes('round') || lower.includes('globe') || lower.includes('ball'))) {
      verdict = 'REAL';
      confidence = 0.99;
      reason = 'Verified: Earth is a sphere (oblate spheroid), confirmed by physics, satellite imagery, space exploration, and gravity principles';
      tags = ['geography', 'science', 'verified', 'earth-shape'];
    }
    else if ((lower.includes('earth') || lower.includes('planet')) && lower.includes('core') && 
             (lower.includes('ice') || lower.includes('frozen') || lower.includes('cold'))) {
      verdict = 'FAKE';
      confidence = 0.99;
      reason = 'FALSE: Earth\'s core is NOT ice. It consists of solid iron inner core and liquid iron outer core at extreme temperatures (5000-7000K), far hotter than the sun\'s surface.';
      tags = ['geology', 'science', 'false', 'misinformation'];
    }
    else if ((lower.includes('earth') || lower.includes('planet')) && lower.includes('core') && 
             (lower.includes('iron') || lower.includes('metal') || lower.includes('hot') || lower.includes('temperature'))) {
      verdict = 'REAL';
      confidence = 0.99;
      reason = 'Verified: Earth\'s core is primarily iron with solid inner core (5200K) and liquid outer core (3800-5500K), confirmed by seismic studies and geophysics';
      tags = ['geology', 'science', 'verified', 'earth-structure'];
    }

    // ============ HEALTH/VACCINES (8-11) ============
    else if ((lower.includes('vaccine') || lower.includes('vaccination')) && 
             (lower.includes('save') || lower.includes('lives') || lower.includes('effective') || lower.includes('protect') || lower.includes('prevent'))) {
      verdict = 'REAL';
      confidence = 0.99;
      reason = 'Verified: Vaccines SAVE LIVES and are scientifically proven effective. WHO reports vaccines prevent 2-3 million deaths annually. Supported by global medical consensus (CDC, WHO, NHS, etc.)';
      tags = ['health', 'medicine', 'public health', 'verified'];
    }
    else if ((lower.includes('vaccine') || lower.includes('vaccination')) && 
             (lower.includes('microchip') || lower.includes('chip') || lower.includes('tracking') || lower.includes('gps') || lower.includes('implant'))) {
      verdict = 'FAKE';
      confidence = 0.99;
      reason = 'FALSE CONSPIRACY: Vaccines do NOT contain microchips, GPS trackers, or any tracking devices. This is completely false with zero scientific evidence. Vaccines contain: mRNA, proteins, lipids, and stabilizers only.';
      tags = ['health', 'conspiracy', 'debunked', 'false-claim'];
    }
    else if ((lower.includes('vaccine') || lower.includes('vaccination')) && 
             (lower.includes('harmful') || lower.includes('poison') || lower.includes('toxic') || lower.includes('dangerous') || lower.includes('kill'))) {
      verdict = 'FAKE';
      confidence = 0.98;
      reason = 'FALSE: Vaccines are safe and extensively tested for safety. Side effects are rare and mild (soreness, fatigue). Serious reactions occur in 1-2 per million. Benefits vastly outweigh risks.';
      tags = ['health', 'misinformation', 'debunked', 'safety'];
    }
    else if ((lower.includes('human') || lower.includes('people') || lower.includes('person')) && 
             (lower.includes('gill') || lower.includes('gills') || lower.includes('develop gills') || lower.includes('grow gills'))) {
      verdict = 'FAKE';
      confidence = 0.99;
      reason = 'FALSE: Humans CANNOT and will NOT develop gills. We are mammals with lungs, not fish. Gills are biological structures for extracting oxygen from water - impossible for humans to develop through evolution or any modification.';
      tags = ['biology', 'science', 'evolution', 'false'];
    }

    // ============ WATER/CHEMISTRY (12-13) ============
    else if (lower.includes('water') && lower.includes('boil') && 
             (lower.includes('100') || lower.includes('celsius') || lower.includes('212') || lower.includes('fahrenheit'))) {
      verdict = 'REAL';
      confidence = 0.99;
      reason = 'Verified: Water boils at exactly 100°C (212°F) at sea level pressure (101.325 kPa). This is a fundamental physics constant.';
      tags = ['science', 'chemistry', 'physics', 'verified', 'constants'];
    }
    else if (lower.includes('water') && lower.includes('freeze') && 
             (lower.includes('0') || lower.includes('celsius') || lower.includes('32') || lower.includes('fahrenheit'))) {
      verdict = 'REAL';
      confidence = 0.99;
      reason = 'Verified: Water freezes at 0°C (32°F) at sea level pressure. This is a fundamental physics and chemistry principle used in all scientific measurements.';
      tags = ['science', 'chemistry', 'physics', 'verified', 'constants'];
    }

    // ============ CELEBRITY/MARRIAGE (14-15) ============
    else if ((lower.includes('virat') || lower.includes('kohli')) && lower.includes('anushka') && 
             (lower.includes('marr') || lower.includes('wife') || lower.includes('husband') || lower.includes('wedding'))) {
      verdict = 'REAL';
      confidence = 0.99;
      reason = 'Verified: Virat Kohli (Indian Cricketer) married Anushka Sharma (Bollywood actress) on December 11, 2017 in Tuscany, Italy, in a private ceremony.';
      tags = ['celebrity', 'cricket', 'bollywood', 'marriage', 'verified', 'india'];
    }
    else if ((lower.includes('dhoni') || lower.includes('ms dhoni') || lower.includes('mahendra')) && 
             lower.includes('sakshi') && 
             (lower.includes('marr') || lower.includes('wife') || lower.includes('husband') || lower.includes('wedding'))) {
      verdict = 'REAL';
      confidence = 0.99;
      reason = 'Verified: MS Dhoni (Mahendra Singh Dhoni, Indian Cricket captain) married Sakshi Singh Rawat on July 6, 2010 in a traditional ceremony. They have been together since.';
      tags = ['celebrity', 'cricket', 'marriage', 'verified', 'india'];
    }

    // ============ CLIMATE/ENVIRONMENT (16-18) ============
    else if ((lower.includes('climate') || lower.includes('global')) && lower.includes('change') && 
             (lower.includes('real') || lower.includes('happening') || lower.includes('proven') || lower.includes('true'))) {
      verdict = 'REAL';
      confidence = 0.99;
      reason = 'Verified: Climate change is REAL and scientifically proven. Global temperatures have increased ~1.1°C since pre-industrial times due to human greenhouse gas emissions. Confirmed by NASA, IPCC, and international consensus.';
      tags = ['environment', 'science', 'climate', 'verified', 'global-warming'];
    }
    else if ((lower.includes('climate') || lower.includes('global')) && lower.includes('change') && 
             (lower.includes('fake') || lower.includes('hoax') || lower.includes('conspiracy') || lower.includes('false'))) {
      verdict = 'FAKE';
      confidence = 0.99;
      reason = 'FALSE: Climate change is real and scientifically documented by NASA, NOAA, IPCC, and 97% of climate scientists worldwide. Extensive evidence from temperature records, sea level rise, ice loss, and atmospheric CO2 increases.';
      tags = ['environment', 'misinformation', 'debunked', 'science-denial'];
    }
    else if ((lower.includes('global') || lower.includes('earth')) && lower.includes('warm') && 
             (lower.includes('real') || lower.includes('happening') || lower.includes('temperature') || lower.includes('rise'))) {
      verdict = 'REAL';
      confidence = 0.98;
      reason = 'Verified: Global warming is REAL. Average global temperatures have risen consistently for 150+ years. Primary cause: greenhouse gas emissions from human activities (burning fossil fuels, deforestation).';
      tags = ['environment', 'science', 'climate', 'verified'];
    }

    // ============ TECHNOLOGY/AI (19-20) ============
    else if ((lower.includes('artificial') || lower.includes('ai')) && 
             (lower.includes('advancing') || lower.includes('developing') || lower.includes('improving') || lower.includes('progress') || lower.includes('evolving'))) {
      verdict = 'REAL';
      confidence = 0.95;
      reason = 'Verified: Artificial Intelligence is rapidly advancing in natural language processing, computer vision, robotics, and countless fields. Active development by major tech companies, research institutions, and startups worldwide.';
      tags = ['technology', 'AI', 'innovation', 'verified'];
    }
    else if ((lower.includes('web3') || lower.includes('blockchain') || lower.includes('crypto')) && 
             (lower.includes('developing') || lower.includes('evolving') || lower.includes('growing'))) {
      verdict = 'REAL';
      confidence = 0.96;
      reason = 'Verified: Web3, Blockchain, and Cryptocurrency technologies are actively evolving and being developed. Thousands of projects, continuous innovation, and increasing institutional adoption occurring worldwide.';
      tags = ['technology', 'blockchain', 'crypto', 'web3', 'verified'];
    }

    if (verdict) {
      return {
        verdict,
        confidence,
        reason,
        tags,
        source_type: 'custom-rules'
      };
    }

    return null;
  }

  // Main analysis function
  analyze(claim) {
    if (!claim || claim.trim().length === 0) {
      return {
        error: 'Claim cannot be empty',
        verdict: 'UNKNOWN',
        confidence: 0
      };
    }

    // FIRST PRIORITY: Check against newspaper dataset extracted facts
    let result = this.analyzeAgainstNewspaperDataset(claim);

    // If no match in newspapers, check against known facts database
    if (!result) {
      result = this.analyzeAgainstDataset(claim);
    }

    // If still no match, apply custom rules
    if (!result) {
      const customResult = this.applyCustomRules(claim);
      if (customResult) {
        result = {
          claim: claim,
          ...customResult,
          sources: []
        };
      } else {
        // Unknown claim
        result = {
          claim: claim,
          verdict: 'UNVERIFIED',
          confidence: 0.5,
          reason: 'Insufficient data in newspaper sources. May require manual review.',
          source_type: 'unknown',
          tags: ['unverified', 'requires-review'],
          sources: []
        };
      }
    }

    // Store in history
    this.analysisHistory.push({
      ...result,
      timestamp: new Date().toISOString()
    });

    return result;
  }

  // Analyze against newspaper dataset
  analyzeAgainstNewspaperDataset(claim) {
    const fact = this.datasetAnalyzer.findFact(claim);
    
    if (fact && fact.similarity > 0.5) {
      return {
        claim: claim,
        verdict: fact.verdict,
        confidence: fact.confidence,
        reason: fact.reason,
        source_type: fact.source_type,
        tags: fact.tags,
        sources: [fact.source],
        matched_fact: fact.claim,
        similarity: fact.similarity,
        analysis_source: 'newspaper-dataset'
      };
    }

    return null;
  }

  // Get analysis history
  getHistory() {
    return this.analysisHistory;
  }

  // Get statistics
  getStatistics() {
    const history = this.analysisHistory;
    const real = history.filter(h => h.verdict === 'REAL').length;
    const fake = history.filter(h => h.verdict === 'FAKE').length;
    const unverified = history.filter(h => h.verdict === 'UNVERIFIED').length;

    return {
      total: history.length,
      real,
      fake,
      unverified,
      accuracy: history.length > 0 ? ((real + fake) / history.length * 100).toFixed(2) + '%' : 'N/A'
    };
  }
}

module.exports = NewsAnalyzer;
