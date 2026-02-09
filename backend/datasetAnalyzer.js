const fs = require('fs');
const path = require('path');

class DatasetAnalyzer {
  constructor() {
    this.newsArticles = [];
    this.extractedFacts = [];
    this.loadAndAnalyzeDataset();
  }

  /**
   * Load newspapers dataset and extract facts
   */
  loadAndAnalyzeDataset() {
    try {
      const newspapersPath = path.join(__dirname, 'newspapers_data.json');
      if (fs.existsSync(newspapersPath)) {
        const newspapersData = fs.readFileSync(newspapersPath, 'utf8');
        this.newsArticles = JSON.parse(newspapersData);
        
        console.log(`\n📰 DATASET ANALYSIS STARTED`);
        console.log(`   Loading ${this.newsArticles.length} newspaper articles...`);
        
        // Extract facts from all articles
        this.extractedFacts = this.extractFactsFromArticles();
        
        console.log(`   ✓ Extracted ${this.extractedFacts.length} verified facts`);
        console.log(`   Fact Categories:`);
        
        const categories = {};
        this.extractedFacts.forEach(fact => {
          fact.tags.forEach(tag => {
            categories[tag] = (categories[tag] || 0) + 1;
          });
        });
        
        Object.entries(categories).forEach(([cat, count]) => {
          console.log(`      - ${cat}: ${count} facts`);
        });
        
        console.log(`\n✓ DATASET ANALYSIS COMPLETE\n`);
      }
    } catch (error) {
      console.error('Error loading newspapers dataset:', error.message);
    }
  }

  /**
   * Extract facts from newspaper articles
   */
  extractFactsFromArticles() {
    const facts = [];

    this.newsArticles.forEach(article => {
      if (article.facts && Array.isArray(article.facts)) {
        article.facts.forEach(fact => {
          facts.push({
            claim: fact.claim,
            verdict: fact.verdict,
            confidence: fact.confidence,
            reason: fact.details,
            source: article.source,
            date: article.date,
            category: article.category,
            tags: article.facts_tags || this.generateTags(article.category, fact.verdict),
            source_type: 'newspaper-verified',
            article_id: article.id,
            verified: true
          });
        });
      }
    });

    return facts;
  }

  /**
   * Generate tags based on category and verdict
   */
  generateTags(category, verdict) {
    const tags = [category, 'verified'];
    if (verdict === 'FAKE') {
      tags.push('debunked', 'false');
    } else if (verdict === 'REAL') {
      tags.push('verified-true', 'real');
    }
    return tags;
  }

  /**
   * Calculate similarity between two strings
   */
  calculateSimilarity(str1, str2) {
    const s1 = str1.toLowerCase();
    const s2 = str2.toLowerCase();
    
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

  /**
   * Find fact from extracted dataset
   */
  findFact(claim) {
    let bestMatch = null;
    let bestSimilarity = 0.5;

    for (const fact of this.extractedFacts) {
      const similarity = this.calculateSimilarity(claim, fact.claim);
      
      if (similarity > bestSimilarity) {
        bestSimilarity = similarity;
        bestMatch = {
          ...fact,
          similarity: similarity
        };
      }
    }

    return bestMatch;
  }

  /**
   * Get all extracted facts
   */
  getAllFacts() {
    return this.extractedFacts;
  }

  /**
   * Get facts by category
   */
  getFactsByCategory(category) {
    return this.extractedFacts.filter(f => f.category === category);
  }

  /**
   * Get statistics
   */
  getDatasetStatistics() {
    const stats = {
      total_facts: this.extractedFacts.length,
      verified_true: this.extractedFacts.filter(f => f.verdict === 'REAL').length,
      verified_false: this.extractedFacts.filter(f => f.verdict === 'FAKE').length,
      by_category: {},
      sources: new Set()
    };

    this.extractedFacts.forEach(fact => {
      stats.by_category[fact.category] = (stats.by_category[fact.category] || 0) + 1;
      stats.sources.add(fact.source);
    });

    stats.sources = Array.from(stats.sources);
    
    return stats;
  }

  /**
   * Print dataset summary
   */
  printSummary() {
    const stats = this.getDatasetStatistics();
    console.log('\n📊 DATASET SUMMARY');
    console.log(`   Total Facts: ${stats.total_facts}`);
    console.log(`   Verified True: ${stats.verified_true}`);
    console.log(`   Verified False: ${stats.verified_false}`);
    console.log(`   Categories: ${Object.keys(stats.by_category).join(', ')}`);
    console.log(`   Sources: ${stats.sources.join(', ')}\n`);
  }
}

module.exports = DatasetAnalyzer;
