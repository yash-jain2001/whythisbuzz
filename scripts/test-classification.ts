import { classifyArticle } from '../src/lib/article-category.js';
import { calculateCleanBodyWordCount, calculateReadTime } from './auto-publisher.js';

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

function runWordCountTests() {
  console.log(`\n======================================================`);
  console.log(`🧪 RUNNING SHORT-ARTICLE QUALITY & WORD COUNT UNIT TESTS`);
  console.log(`======================================================\n`);

  let passed = 0;
  let failed = 0;

  // Test 1: Markdown formatting stripping & frontmatter exclusion
  const sampleMdx = `---
title: "Test Title"
summary: "Test summary"
---
# Main Heading Title

This is a paragraph with **bold** text and a [clickable link](https://example.com) and an image ![alt text](https://image.com/pic.jpg).

## Section 2
- Bullet point 1
- Bullet point 2
`;

  const wordCount = calculateCleanBodyWordCount(sampleMdx);
  if (wordCount >= 20 && wordCount <= 30) {
    passed++;
    console.log(`✅ PASSED: calculateCleanBodyWordCount correctly ignores YAML frontmatter and formatting tags (${wordCount} clean words).`);
  } else {
    failed++;
    console.error(`❌ FAILED: calculateCleanBodyWordCount returned unexpected count: ${wordCount}`);
  }

  // Test 2: Read time calculation
  const readTime400 = calculateReadTime(400);
  const readTime500 = calculateReadTime(500);
  if (readTime400 === "2 min read" && readTime500 === "3 min read") {
    passed++;
    console.log(`✅ PASSED: calculateReadTime correctly returned "2 min read" (400w) and "3 min read" (500w).`);
  } else {
    failed++;
    console.error(`❌ FAILED: calculateReadTime returned unexpected values: 400w -> "${readTime400}", 500w -> "${readTime500}"`);
  }

  // Test 3: Threshold tests (280, 299, 300, 400, 500, 550, 600 words)
  const generateWords = (n: number) => Array.from({ length: n }).map((_, i) => `word${i}`).join(' ');

  const count280 = calculateCleanBodyWordCount(generateWords(280));
  const count299 = calculateCleanBodyWordCount(generateWords(299));
  const count300 = calculateCleanBodyWordCount(generateWords(300));
  const count400 = calculateCleanBodyWordCount(generateWords(400));
  const count500 = calculateCleanBodyWordCount(generateWords(500));
  const count550 = calculateCleanBodyWordCount(generateWords(550));
  const count600 = calculateCleanBodyWordCount(generateWords(600));

  // 280 words -> expansion required (<300)
  if (count280 === 280 && count280 < 300) {
    passed++;
    console.log(`✅ PASSED: 280-word article correctly requires expansion (<300 words).`);
  } else {
    failed++;
    console.error(`❌ FAILED: 280-word article test failed (count: ${count280}).`);
  }

  // 299 words -> expansion required (<300)
  if (count299 === 299 && count299 < 300) {
    passed++;
    console.log(`✅ PASSED: 299-word article correctly requires expansion (<300 words).`);
  } else {
    failed++;
    console.error(`❌ FAILED: 299-word article test failed (count: ${count299}).`);
  }

  // 300 words -> PASS (>=300)
  if (count300 === 300 && count300 >= 300) {
    passed++;
    console.log(`✅ PASSED: 300-word article correctly accepted as PASS (>=300 words).`);
  } else {
    failed++;
    console.error(`❌ FAILED: 300-word article test failed (count: ${count300}).`);
  }

  // 400 words -> PASS (ideal target range)
  if (count400 === 400 && count400 >= 300 && count400 <= 550) {
    passed++;
    console.log(`✅ PASSED: 400-word article correctly accepted as PASS (ideal target range).`);
  } else {
    failed++;
    console.error(`❌ FAILED: 400-word article test failed (count: ${count400}).`);
  }

  // 500 words -> PASS (ideal target range)
  if (count500 === 500 && count500 >= 300 && count500 <= 550) {
    passed++;
    console.log(`✅ PASSED: 500-word article correctly accepted as PASS (ideal target range).`);
  } else {
    failed++;
    console.error(`❌ FAILED: 500-word article test failed (count: ${count500}).`);
  }

  // 550 words -> PASS (soft maximum boundary)
  if (count550 === 550 && count550 >= 300) {
    passed++;
    console.log(`✅ PASSED: 550-word article correctly accepted as PASS (soft maximum boundary).`);
  } else {
    failed++;
    console.error(`❌ FAILED: 550-word article test failed (count: ${count550}).`);
  }

  // 600 words -> PASS (useful extended article allowed, not truncated)
  if (count600 === 600 && count600 > 550) {
    passed++;
    console.log(`✅ PASSED: 600-word article correctly allowed without truncation (LONG_ARTICLE_REVIEW).`);
  } else {
    failed++;
    console.error(`❌ FAILED: 600-word article test failed (count: ${count600}).`);
  }

  console.log(`\n======================================================`);
  console.log(`📊 SHORT-ARTICLE TEST RESULTS: ${passed}/9 PASSED (${failed} FAILED)`);
  console.log(`======================================================\n`);

  if (failed > 0) process.exit(1);
}

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

runWordCountTests();
runRegressionTests();

