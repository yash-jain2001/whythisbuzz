import { classifyArticle, CanonicalCategory } from '../src/lib/article-category';

interface TestCase {
  name: string;
  input: {
    title: string;
    summary?: string;
    content?: string;
    sourceCategory?: string;
  };
  expectedCategory: CanonicalCategory;
}

const testCases: TestCase[] = [
  // Sports
  {
    name: 'Judd Trump snooker',
    input: { title: 'Judd Trump Wins World Snooker Championship Title' },
    expectedCategory: 'Sports',
  },
  {
    name: 'NWSL Showdown',
    input: { title: 'NWSL Showdown: Portland Thorns vs OL Reign' },
    expectedCategory: 'Sports',
  },
  {
    name: 'PGA Tour',
    input: { title: 'PGA Tour Leaderboard: Scottie Scheffler Takes Lead' },
    expectedCategory: 'Sports',
  },
  {
    name: 'Korn Ferry Tour',
    input: { title: 'Korn Ferry Tour Finals: Up and Coming Golfers Battle for Cards' },
    expectedCategory: 'Sports',
  },
  {
    name: 'DP World Tour',
    input: { title: 'DP World Tour Highlights: McIlroy Secures Victory in Dubai' },
    expectedCategory: 'Sports',
  },
  {
    name: 'Tour Championship',
    input: { title: 'Tour Championship Final Round Drama in Atlanta' },
    expectedCategory: 'Sports',
  },
  {
    name: 'Arsenal match',
    input: { title: 'Arsenal Match Ends in Dramatic 2-1 Victory Over Chelsea' },
    expectedCategory: 'Sports',
  },
  {
    name: 'Champions League',
    input: { title: 'UEFA Champions League Final Preview: Real Madrid vs Bayern' },
    expectedCategory: 'Sports',
  },
  {
    name: 'Lionel Messi viral comparisons',
    input: { title: 'Lionel Messi Viral Comparisons Spark Football Debate Online' },
    expectedCategory: 'Sports',
  },
  {
    name: 'sports article containing "war"',
    input: { title: 'Germany vs France: Round of 16 Clash - War on the Pitch' },
    expectedCategory: 'Sports',
  },
  {
    name: 'sports article containing "blockbuster"',
    input: { title: 'Blockbuster Match Fixture: Manchester City vs Arsenal' },
    expectedCategory: 'Sports',
  },
  {
    name: 'sports article containing "racing"',
    input: { title: 'F1 Grand Prix: Verstappen Racing to Victory in Monaco' },
    expectedCategory: 'Sports',
  },

  // Politics
  {
    name: 'Quebec Premier campaign',
    input: { title: "Why Quebec's Premier is Pausing Her Campaign Right Now" },
    expectedCategory: 'Politics',
  },
  {
    name: 'Donald Trump executive order',
    input: { title: 'Donald Trump Signs Executive Order on Immigration Policy' },
    expectedCategory: 'Politics',
  },
  {
    name: 'Doug Ford / Trump Lake Decree',
    input: { title: "Why Doug Ford's Bold Move Against Trump's Lake Decree Is Going Viral" },
    expectedCategory: 'Politics',
  },
  {
    name: 'US Supreme Court case',
    input: { title: 'US Supreme Court Hears Landmark Constitutional Law Case' },
    expectedCategory: 'Politics',
  },
  {
    name: 'UK Prime Minister cabinet reshuffle',
    input: { title: 'UK Prime Minister Announces Major Cabinet Reshuffle' },
    expectedCategory: 'Politics',
  },

  // Economics
  {
    name: 'Fed interest rates',
    input: { title: 'Federal Reserve Cuts Interest Rates by 50 Basis Points' },
    expectedCategory: 'Economics',
  },
  {
    name: 'Binance crypto trading',
    input: { title: 'Binance Crypto Trading Volume Jumps Following Regulatory Approval' },
    expectedCategory: 'Economics',
  },
  {
    name: 'government debt',
    input: { title: 'Government Debt Reaches Historic High in Third Quarter' },
    expectedCategory: 'Economics',
  },
  {
    name: 'pension reform',
    input: { title: 'Pension Reform Proposals Spark Financial Debates' },
    expectedCategory: 'Economics',
  },
  {
    name: 'stock market',
    input: { title: 'Stock Market Rally Pushes Dow Jones to Record Highs' },
    expectedCategory: 'Economics',
  },
  {
    name: 'tariff/trade economic article',
    input: { title: 'New Retaliation Tariff Threats Threaten Import Trade Market' },
    expectedCategory: 'Economics',
  },
  {
    name: 'Loblaws/Metro/Sobeys lawsuit',
    input: { title: 'Loblaws and Metro Face Price-Fixing Commercial Lawsuit' },
    expectedCategory: 'Economics',
  },

  // Technology
  {
    name: 'iPhone',
    input: { title: 'Apple iPhone 16 Pro Battery Life and Chip Upgrade Detailed' },
    expectedCategory: 'Technology',
  },
  {
    name: 'Samsung Galaxy smartphone',
    input: { title: 'Samsung Galaxy Smartphone Features New AI Camera Tech' },
    expectedCategory: 'Technology',
  },
  {
    name: 'Nvidia technology article',
    input: { title: 'Nvidia Unveils Next-Generation AI Chip Architecture' },
    expectedCategory: 'Technology',
  },
  {
    name: 'ChatGPT launch',
    input: { title: 'OpenAI Announces ChatGPT Search Feature Launch' },
    expectedCategory: 'Technology',
  },
  {
    name: 'Claude AI',
    input: { title: 'Anthropic Claude AI Model Tops Benchmark Scores' },
    expectedCategory: 'Technology',
  },
  {
    name: 'Apple AI security',
    input: { title: 'Apple Racing to Fix AI Security Vulnerability in iOS Update' },
    expectedCategory: 'Technology',
  },
  {
    name: 'SpaceX/Starship technology',
    input: { title: 'SpaceX Starship Orbital Test Flight Achieves Spacecraft Staging' },
    expectedCategory: 'Technology',
  },
  {
    name: 'Nvidia revenue surge',
    input: { title: 'Nvidia Revenue Surge Driven by Surging AI Chip Demand' },
    expectedCategory: 'Technology',
  },

  // Entertainment
  {
    name: 'Netflix movie',
    input: { title: 'Netflix New Sci-Fi Movie Trailer Tops Streaming Charts' },
    expectedCategory: 'Entertainment',
  },
  {
    name: 'Marvel movie',
    input: { title: 'Marvel MCU Blockbuster Movie Box Office Opener Announced' },
    expectedCategory: 'Entertainment',
  },
  {
    name: 'Madonna VMAs',
    input: { title: 'Madonna VMAs Voting Drama Sparks Pop Culture Buzz' },
    expectedCategory: 'Entertainment',
  },
  {
    name: 'Bruno Mars stadium show',
    input: { title: 'Bruno Mars Stadium Show Adds Extra Concert Dates' },
    expectedCategory: 'Entertainment',
  },
  {
    name: 'Manchester Pride',
    input: { title: 'Manchester Pride Festival Line-up Announced' },
    expectedCategory: 'Entertainment',
  },
  {
    name: 'Apple TV+ drama',
    input: { title: 'Apple TV+ Drama Series Imperfect Women Stars Joel Kinnaman' },
    expectedCategory: 'Entertainment',
  },
  {
    name: 'Survivor Greece lawsuit',
    input: { title: 'Survivor Greece Lawsuit Filed by Contestant Against Show Producers' },
    expectedCategory: 'Entertainment',
  },

  // Social-Media
  {
    name: 'TikTok trend',
    input: { title: 'TikTok Video Trend Goes Viral Across Internet Platform' },
    expectedCategory: 'Social-Media',
  },
  {
    name: 'TikTok/Reels video',
    input: { title: 'New Instagram Reels Feature Gives Content Creators More Tools' },
    expectedCategory: 'Social-Media',
  },
  {
    name: 'influencer/social media article',
    input: { title: 'Top Social Media Influencers Face Backlash Over Sponsored Post' },
    expectedCategory: 'Social-Media',
  },

  // World Affairs
  {
    name: 'NATO summit',
    input: { title: 'NATO Summit Addresses Global Security and Alliance Diplomacy' },
    expectedCategory: 'World Affairs',
  },
  {
    name: 'UN Security Council',
    input: { title: 'UN Security Council Passes Ceasefire Resolution' },
    expectedCategory: 'World Affairs',
  },
  {
    name: 'international conflict',
    input: { title: 'International Conflict Escalates in Middle East Border Region' },
    expectedCategory: 'World Affairs',
  },
  {
    name: 'genuine natural disaster',
    input: { title: 'Devastating Earthquake and Tsunami Warning Hit Coastal Region' },
    expectedCategory: 'World Affairs',
  },
  {
    name: 'Missile + Arsenal shortage',
    input: { title: 'Missile and Weapon Arsenal Shortage in Middle East Conflict' },
    expectedCategory: 'World Affairs',
  },
];

let passed = 0;
let failed = 0;

console.log(`Running Regression Test Suite (${testCases.length} test cases)...`);

testCases.forEach((test, idx) => {
  const result = classifyArticle(test.input);
  if (result.category === test.expectedCategory) {
    passed++;
    console.log(`✓ [PASS] #${idx + 1}: ${test.name} -> ${result.category} (Confidence: ${result.confidence}%)`);
  } else {
    failed++;
    console.error(`✗ [FAIL] #${idx + 1}: ${test.name}`);
    console.error(`  Input Title: "${test.input.title}"`);
    console.error(`  Expected: ${test.expectedCategory}`);
    console.error(`  Got: ${result.category} (${result.reason})`);
    console.error(`  Matched Signals:`, result.matchedSignals);
  }
});

console.log(`\n========================================`);
console.log(`SUMMARY: Total: ${testCases.length} | Passed: ${passed} | Failed: ${failed}`);
console.log(`========================================\n`);

if (failed > 0) {
  process.exit(1);
}
