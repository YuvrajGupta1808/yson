/**
 * Main benchmark runner
 * Compares JSON, TOON, and YSON on token efficiency
 */

import { TokenCounter } from './token_counter.js';

// Test data
const testData = {
  company: {
    name: "TechCorp",
    founded: 2020,
    revenue: 5000000,
    employees: [
      { id: 1, name: "Alice Johnson", role: "CEO", salary: 200000 },
      { id: 2, name: "Bob Smith", role: "CTO", salary: 180000 },
      { id: 3, name: "Charlie Brown", role: "Engineer", salary: 120000 }
    ],
    offices: [
      { city: "San Francisco", country: "USA", size: 5000 },
      { city: "London", country: "UK", size: 3000 }
    ]
  }
};

function main() {
  console.log('='.repeat(70));
  console.log('YSON BENCHMARK: Token Efficiency Comparison');
  console.log('='.repeat(70));

  console.log('\n📏 TOKEN EFFICIENCY\n');
  const tokenResults = TokenCounter.compare(testData);
  TokenCounter.report(tokenResults);

  console.log('\n' + '='.repeat(70));
  console.log('BENCHMARK COMPLETE');
  console.log('='.repeat(70));
}

main();
