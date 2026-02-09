const NewsAnalyzer = require('./newsAnalyzer');

const analyzer = new NewsAnalyzer();

const testClaims = [
  "The sun rises in the east",
  "The sun rises in the west",
  "The earth is flat",
  "Vaccines save lives",
  "Vaccines contain microchips",
  "Water boils at 100 celsius",
  "Moon landings are fake",
  "Chandrayaan-3 landed on the moon",
  "Virat Kohli married Anushka Sharma",
  "MS Dhoni married Sakshi Singh Rawat",
  "Climate change is real",
  "Climate change is a hoax",
  "Global warming is happening",
  "Artificial intelligence is advancing",
  "Humans can develop gills"
];

console.log('=== COMPREHENSIVE ANALYZER TEST ===\n');

testClaims.forEach((claim, idx) => {
  const result = analyzer.analyze(claim);
  console.log(`\n[${idx + 1}] Claim: "${claim}"`);
  console.log(`    Verdict: ${result.verdict}`);
  console.log(`    Confidence: ${result.confidence}`);
  console.log(`    Reason: ${result.reason}`);
  console.log(`    Tags: ${result.tags.join(', ')}`);
});

console.log('\n\n=== STATISTICS ===');
const stats = analyzer.getStatistics();
console.log(`Total Analyzed: ${stats.total}`);
console.log(`REAL: ${stats.real}`);
console.log(`FAKE: ${stats.fake}`);
console.log(`UNVERIFIED: ${stats.unverified}`);
console.log(`Accuracy: ${stats.accuracy}`);
