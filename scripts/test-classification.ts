import { classifyArticle } from '../src/lib/article-category.js';

interface TestCase {
  input: {
    title: string;
    summary?: string;
    content?: string;
  };
  expectedCategory: string;
  description: string;
}

const TEST_CASES: TestCase[] = [
  // --- Core Target Cases ---
  {
    input: { title: "Why São Paulo is Facing a Massive Crisis in the Sul-Americana" },
    expectedCategory: "Sports",
    description: "São Paulo FC / Sul-Americana football crisis",
  },
  {
    input: { title: "Why Robert Downey Jr. is Returning as Iron Man Right Now" },
    expectedCategory: "Entertainment",
    description: "Robert Downey Jr Marvel Iron Man movie announcement",
  },
  {
    input: { title: "The Real Reason Behind Duane Davis's High-Stakes Tupac Murder Trial" },
    expectedCategory: "Entertainment",
    description: "Duane Davis / Tupac Shakur trial",
  },
  {
    input: { title: "Inside iPhone 18 Pro: What You Need to Know" },
    expectedCategory: "Technology",
    description: "iPhone 18 Pro smartphone launch",
  },

  // --- Category Representation Cases ---
  {
    input: { title: "India election results: PM Modi secures parliamentary vote victory" },
    expectedCategory: "Politics",
    description: "Election results and parliamentary vote",
  },
  {
    input: { title: "US inflation falls to 2.1% as Federal Reserve considers interest rate cuts" },
    expectedCategory: "Economics",
    description: "US inflation and Federal Reserve monetary policy",
  },
  {
    input: { title: "UN ceasefire talks resume in Gaza amid international diplomatic pressure" },
    expectedCategory: "World Affairs",
    description: "UN Gaza ceasefire diplomacy",
  },
  {
    input: { title: "Instagram launches new creator video features to compete with TikTok viral trends" },
    expectedCategory: "Social-Media",
    description: "Instagram & TikTok platform updates",
  },

  // --- Ambiguous Multi-Category & Primary Subject Cases ---
  {
    input: { title: "Apple reports record revenue after launching the groundbreaking iPhone 18 Pro" },
    expectedCategory: "Technology",
    description: "Apple iPhone 18 Pro launch with financial keywords (Primary subject is Technology)",
  },
  {
    input: { title: "Nvidia earnings surge as revolutionary new AI chip launches for developers" },
    expectedCategory: "Technology",
    description: "Nvidia AI chip launch with earnings context (Primary subject is Technology)",
  },
  {
    input: { title: "SpaceX stock market valuation hits historic high ahead of Starship orbital flight" },
    expectedCategory: "Technology",
    description: "SpaceX Starship orbital flight tech with valuation keywords",
  },
  {
    input: { title: "Premier League football club facing financial crisis and bankruptcy lawsuit" },
    expectedCategory: "Sports",
    description: "Football club facing financial crisis (Primary subject is Sports)",
  },
  {
    input: { title: "Hollywood actor facing high-profile criminal court trial after red carpet arrest" },
    expectedCategory: "Entertainment",
    description: "Hollywood actor trial (Primary subject is Entertainment)",
  },
  {
    input: { title: "Popular YouTube creator involved in viral political campaign controversy" },
    expectedCategory: "Social-Media",
    description: "YouTube creator controversy (Primary subject is Social-Media)",
  },
];

function runRegressionTests() {
  console.log(`\n======================================================`);
  console.log(`🧪 RUNNING CANONICAL CATEGORY CLASSIFICATION REGRESSION TESTS`);
  console.log(`======================================================\n`);

  let passed = 0;
  let failed = 0;

  for (const test of TEST_CASES) {
    const result = classifyArticle(test.input);
    const isMatch = result.category === test.expectedCategory;

    if (isMatch) {
      passed++;
      console.log(`✅ PASSED [${result.category.padEnd(14)}] "${test.input.title}"`);
      console.log(`   (Conf: ${result.confidence}%, Method: ${result.method}, Signals: ${result.matchedSignals.join(', ')})`);
    } else {
      failed++;
      console.error(`❌ FAILED [${test.description}]: Expected "${test.expectedCategory}" but got "${result.category}" for "${test.input.title}"`);
      console.error(`   Reason: ${result.reason}`);
    }
  }

  console.log(`\n======================================================`);
  console.log(`📊 REGRESSION TEST RESULTS: ${passed}/${TEST_CASES.length} PASSED (${failed} FAILED)`);
  console.log(`======================================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runRegressionTests();
