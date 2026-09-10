import * as fs from 'fs';
import * as path from 'path';

const validationPath = path.resolve(__dirname, 'detailed_48_validation.json');
if (!fs.existsSync(validationPath)) {
  console.error('detailed_48_validation.json not found');
  process.exit(1);
}

const candidates: any[] = JSON.parse(fs.readFileSync(validationPath, 'utf8'));

interface CategorizedResults {
  definitelySafe: any[];
  manualReview: any[];
  rejectedMigrations: any[];
  legacyFixes: any[];
}

const results: CategorizedResults = {
  definitelySafe: [],
  manualReview: [],
  rejectedMigrations: [],
  legacyFixes: [],
};

for (const c of candidates) {
  // Legacy fixes
  if (c.isLegacy) {
    results.legacyFixes.push({
      id: c.id,
      slug: c.slug,
      title: c.title,
      currentCategory: c.currentCategory,
      proposedCategory: c.proposedCategory,
      primarySubject: c.proposedCategory,
      confidence: 100,
      reason: `Legacy database category '${c.currentCategory}' mapped to canonical '${c.proposedCategory}'`,
    });
    continue;
  }

  // Evaluate candidate by ID / Slug
  switch (c.slug) {
    // --- SPORTS DEFINITELY SAFE ---
    case 'lipowitz-reigns-in-slovenia-a-tour-de-france-dark-horse-emerges':
    case 'pogacars-unstoppable-reign-continues-as-young-gun-seixas-shakes-up-tour-de-france-podium-battle':
    case 'pogacars-pyrenean-power-play-how-he-seized-tour-de-france-control':
      results.definitelySafe.push({
        ...c,
        primarySubject: 'Sports (Tour de France cycling race)',
        evalReason: 'Tour de France is an iconic professional cycling sports competition.',
      });
      break;

    case 'scooter-shenanigans-nascar-rivals-ryan-blaney-and-chase-elliott-go-viral':
      results.definitelySafe.push({
        ...c,
        primarySubject: 'Sports (NASCAR drivers)',
        evalReason: 'Features top NASCAR professional drivers Ryan Blaney & Chase Elliott.',
      });
      break;

    case 'snooker-shockwave-judd-trumps-world-no-1-reign-rocked-by-china-open-upset':
      results.definitelySafe.push({
        ...c,
        primarySubject: 'Sports (Snooker tournament)',
        evalReason: 'Covers World No. 1 snooker player Judd Trump in China Open.',
      });
      break;

    case 'why-marcus-rashfords-man-utd-future-is-hanging-in-the-balance':
      results.definitelySafe.push({
        ...c,
        primarySubject: 'Sports (Football / Man Utd)',
        evalReason: 'Manchester United footballer transfer window future.',
      });
      break;

    case 'inside-the-sacramento-state-football-scare-what-you-need-to-know':
      results.definitelySafe.push({
        ...c,
        primarySubject: 'Sports (College Football)',
        evalReason: 'Covers Sacramento State college football team.',
      });
      break;

    // --- ECONOMICS DEFINITELY SAFE ---
    case 'sandp-500-sinks-the-perfect-storm-that-crushed-markets':
      results.definitelySafe.push({
        ...c,
        primarySubject: 'Economics (Stock Market)',
        evalReason: 'Covers S&P 500 stock market decline and Wall Street trading.',
      });
      break;

    case 'lindner-unloads-on-merz-germanys-pension-war-heats-up':
    case 'germanys-pension-tsunami-why-your-retirement-income-just-got-a-reality-check':
    case 'the-real-reason-behind-frances-new-pension-reform-plan':
      results.definitelySafe.push({
        ...c,
        primarySubject: 'Economics (Pension Reform)',
        evalReason: 'Covers national retirement income financial systems and pension math.',
      });
      break;

    case 'why-the-2026-stock-market-under-trump-is-shifting-right-now':
      results.definitelySafe.push({
        ...c,
        primarySubject: 'Economics (Stock Market)',
        evalReason: 'Covers Wall Street equity market shifts and investor portfolio strategies.',
      });
      break;

    case 'inside-the-canada-us-tariff-talks-what-you-need-to-know':
    case 'the-real-reason-behind-the-sudden-us-canada-trade-war':
    case 'the-real-reason-behind-trumps-bold-new-tariff-strategy':
      results.definitelySafe.push({
        ...c,
        primarySubject: 'Economics (Tariffs & International Trade)',
        evalReason: 'Covers import trade quotas, commercial tariffs, and international trade policy.',
      });
      break;

    case 'what-binances-new-ai-trading-launch-means-for-crypto':
    case 'why-binances-new-ai-agent-platform-changes-crypto-trading':
    case 'why-cz-binance-is-making-an-unexpected-move-in-bhutan-right-now':
    case 'why-the-binance-app-is-trending-right-now':
      results.definitelySafe.push({
        ...c,
        primarySubject: 'Economics (Cryptocurrency Exchange / Finance)',
        evalReason: 'Covers Binance crypto trading, automated financial trading, and Web3 assets.',
      });
      break;

    // --- POLITICS DEFINITELY SAFE ---
    case 'power-play-why-virginias-governor-is-fighting-a-massive-utility-merger':
      results.definitelySafe.push({
        ...c,
        primarySubject: 'Politics (Governor Political Action)',
        evalReason: 'Virginia Governor Spanberger political intervention in regulatory affairs.',
      });
      break;

    case 'how-mp-josh-burns-unexpectedly-navigated-his-hardest-year-yet':
      results.definitelySafe.push({
        ...c,
        primarySubject: 'Politics (Parliamentary MP)',
        evalReason: 'Profile of Federal Labor MP Josh Burns navigating parliamentary life.',
      });
      break;

    // --- WORLD AFFAIRS DEFINITELY SAFE ---
    case 'why-russias-foreign-minister-accuses-germany-of-war':
      results.definitelySafe.push({
        ...c,
        primarySubject: 'World Affairs (Geopolitical War Threat)',
        evalReason: 'International diplomacy and war threats between Russia and Germany.',
      });
      break;

    // --- ENTERTAINMENT DEFINITELY SAFE ---
    case 'inside-manchester-pride-2026-what-you-need-to-know':
      results.definitelySafe.push({
        ...c,
        primarySubject: 'Entertainment (Festival & Cultural Event)',
        evalReason: 'Manchester Pride music and LGBTQ+ festival celebration.',
      });
      break;

    case 'why-marvel-rivals-season-10-is-changing-everything':
      results.definitelySafe.push({
        ...c,
        primarySubject: 'Entertainment (Marvel Video Game Content)',
        evalReason: 'Marvel media superhero video game season update.',
      });
      break;

    // --- REJECTED MIGRATIONS (PROPOSED NEW CATEGORY IS INCORRECT) ---
    case 'kylian-mbappe-french-footballs-troubled-genius-or-political-game-changer':
      results.rejectedMigrations.push({
        ...c,
        primarySubject: 'Sports (Football Star)',
        evalReason: 'Article centers on football superstar Mbappé, Real Madrid transfer, and Euro 2024. Off-pitch political comments do not override Sports subject.',
      });
      break;

    case 'inside-boxing-day-what-you-need-to-know-about-the-global-holiday':
      results.rejectedMigrations.push({
        ...c,
        primarySubject: 'World Affairs / Lifestyle (Boxing Day Holiday)',
        evalReason: 'Boxing Day is a holiday celebrated on Dec 26. Proposed category "Sports" is completely wrong.',
      });
      break;

    case 'kscs-redemption-battle-ambrosius-and-co-eye-crucial-furth-clash-after-derby-disaster':
      results.rejectedMigrations.push({
        ...c,
        primarySubject: 'Sports (German Football Match)',
        evalReason: 'Article covers Karlsruher SC vs Greuther Fürth football derby. Proposed category "World Affairs" (due to "disaster") is wrong.',
      });
      break;

    case 'the-real-reason-behind-grian-chattens-viral-welsh-football-shirt':
      results.rejectedMigrations.push({
        ...c,
        primarySubject: 'Entertainment (Rock Band Performance / Fashion)',
        evalReason: 'Fontaines D.C. rock band singer wearing a football shirt at Reading Festival. Subject is music performance fashion.',
      });
      break;

    case 'the-real-reason-behind-frances-sweeping-school-smartphone-ban':
      results.rejectedMigrations.push({
        ...c,
        primarySubject: 'Politics (Government Education Policy)',
        evalReason: 'Ministry of Education government policy ban in schools. Proposed category "Technology" ignores the political/legislative nature of the ban.',
      });
      break;

    case 'why-rosenheims-diy-fireworks-blast-left-teens-critical':
      results.rejectedMigrations.push({
        ...c,
        primarySubject: 'World Affairs (Local Accident / Emergency)',
        evalReason: 'Pyrotechnic explosion emergency in Rosenheim. Proposed category "Social-Media" is incorrect.',
      });
      break;

    // --- MANUAL REVIEW (GENUINE DUAL/AMBIGUOUS SUBJECT) ---
    case 'middle-east-meltdown-trumps-claims-oil-price-chaos-and-recession-fears':
      results.manualReview.push({
        ...c,
        primarySubject: 'Geopolitics / Economics (War & Global Recession)',
        evalReason: 'Equal split between Middle East geopolitical war and global economic recession warnings.',
      });
      break;

    case 'spacex-bags-dollar920mmonth-google-deal-an-ai-lifeline-before-ipo':
      results.manualReview.push({
        ...c,
        primarySubject: 'Technology / Economics (AI Big Tech Deal & IPO)',
        evalReason: 'Dual theme: Big tech AI compute partnership between SpaceX/Google and financial IPO valuation.',
      });
      break;

    case 'ucl-finals-power-play-why-brandon-flowers-and-david-beckham-are-racing-to-budapest':
      results.manualReview.push({
        ...c,
        primarySubject: 'Sports / Entertainment (UCL Final & Rock Concert)',
        evalReason: 'Combines UEFA Champions League Final kickoff and rock singer Brandon Flowers performance.',
      });
      break;

    case 'trumps-iran-pause-how-geopolitics-ignited-bitcoins-wild-ride':
      results.manualReview.push({
        ...c,
        primarySubject: 'Economics / World Affairs (Crypto Market & Iran Geopolitics)',
        evalReason: 'Combines Bitcoin market volatility with Iranian diplomatic negotiations.',
      });
      break;

    case 'the-real-reason-behind-nvidias-unreal-dollar96-billion-revenue-surge':
      results.manualReview.push({
        ...c,
        primarySubject: 'Technology / Economics (AI Hardware Giant Earnings)',
        evalReason: 'Covers Nvidia AI GPU chip dominance and quarterly financial earnings ($96B revenue).',
      });
      break;

    case 'why-6th-generation-fighters-are-transforming-air-warfare':
      results.manualReview.push({
        ...c,
        primarySubject: 'Technology / World Affairs (Defense Aerospace & Warfare)',
        evalReason: 'Covers 6th-gen stealth aircraft technology and global military air warfare tactics.',
      });
      break;

    case 'why-cambridges-vice-chancellor-just-admitted-to-deep-concerns-over-high-profile-resignation':
      results.manualReview.push({
        ...c,
        primarySubject: 'World Affairs / Politics (Academic Governance)',
        evalReason: 'University of Cambridge vice-chancellor investigation into faculty hiring/plagiarism.',
      });
      break;

    case 'why-social-media-influencer-manjeet-kaurs-tragic-murder-shocked-us':
      results.manualReview.push({
        ...c,
        primarySubject: 'World Affairs / Social-Media (Crime Investigation)',
        evalReason: 'Tragic murder investigation of an influencer. Dual theme: crime news vs social-media figure.',
      });
      break;

    case 'why-starbucks-snoopy-merchandise-is-going-viral-right-now':
      results.manualReview.push({
        ...c,
        primarySubject: 'Entertainment / Social-Media (Brand Collaboration)',
        evalReason: 'Starbucks x Peanuts Snoopy merch drop going viral online.',
      });
      break;

    case 'why-donald-trump-is-threatening-to-cut-off-us-trade':
      results.manualReview.push({
        ...c,
        primarySubject: 'Politics / Economics (Presidential Trade Policy)',
        evalReason: 'Donald Trump presidential trade embargo threats.',
      });
      break;

    // AI Video Tool + TikTok (8 articles)
    case 'why-ai-video-generators-are-taking-over-tiktok-right-now':
    case 'why-ai-video-generators-are-suddenly-taking-over-tiktok':
    case 'why-ai-inspos-new-video-tool-is-shaking-up-tiktok-and-reels-right-now':
    case 'why-ai-inspos-new-video-generator-is-winning-tiktok':
    case 'why-ai-inspos-new-video-generator-is-winning-over-tiktok':
    case 'why-ai-inspos-new-video-generator-is-changing-tiktok':
    case 'why-ai-inspos-new-video-generator-is-going-viral':
    case 'why-ai-inspos-new-video-tool-is-changing-tiktok':
      results.manualReview.push({
        ...c,
        primarySubject: 'Technology / Social-Media (AI Generator & TikTok Creation)',
        evalReason: 'Dual subject: AI video generator software launch (Technology) vs TikTok/Reels short-form content creation (Social-Media).',
      });
      break;

    default:
      results.manualReview.push({
        ...c,
        primarySubject: 'Ambiguous',
        evalReason: 'Requires human editorial review.',
      });
      break;
  }
}

console.log('=== FINAL AUDIT CATEGORIZATION RESULTS ===');
console.log(`Legacy Fixes: ${results.legacyFixes.length}`);
console.log(`Definitely Safe: ${results.definitelySafe.length}`);
console.log(`Manual Review: ${results.manualReview.length}`);
console.log(`Rejected Migrations: ${results.rejectedMigrations.length}`);
console.log(`Total Candidates: ${candidates.length}`);

fs.writeFileSync(
  path.resolve(__dirname, 'final_categorized_eval.json'),
  JSON.stringify(results, null, 2)
);

// Generate NEW REVIEW-ONLY SQL containing ONLY DEFINITELY SAFE & LEGACY FIXES
const allApproved = [...results.legacyFixes, ...results.definitelySafe];

let safeSql = `-- DEFINITELY SAFE MIGRATIONS SCRIPT (REVIEW ONLY - DO NOT EXECUTE AUTOMATICALLY)
-- Contains ONLY ${allApproved.length} verified safe migrations (${results.legacyFixes.length} Legacy + ${results.definitelySafe.length} Definitely Safe)
-- Generated on: ${new Date().toISOString()}

BEGIN;

`;

allApproved.forEach((item: any, idx: number) => {
  safeSql += `-- #${idx + 1}: ${item.title.replace(/'/g, "''")}\n`;
  safeSql += `-- Primary Subject: ${item.primarySubject}\n`;
  safeSql += `-- Reason: ${item.evalReason || item.reason}\n`;
  safeSql += `UPDATE articles SET category = '${item.proposedCategory}' WHERE id = '${item.id}';\n\n`;
});

safeSql += `COMMIT;\n`;

fs.writeFileSync(path.resolve(__dirname, 'definitely_safe_migrations.sql'), safeSql);

let rollbackSql = `-- ROLLBACK SCRIPT FOR DEFINITELY SAFE MIGRATIONS
-- Reverts ${allApproved.length} article categories back to original values
-- Generated on: ${new Date().toISOString()}

BEGIN;

`;

allApproved.forEach((item: any, idx: number) => {
  rollbackSql += `-- #${idx + 1}: Revert "${item.title.replace(/'/g, "''")}" back to '${item.currentCategory}'\n`;
  rollbackSql += `UPDATE articles SET category = '${item.currentCategory}' WHERE id = '${item.id}';\n\n`;
});

rollbackSql += `COMMIT;\n`;

fs.writeFileSync(path.resolve(__dirname, 'rollback_definitely_safe_migrations.sql'), rollbackSql);

console.log('Saved definitely_safe_migrations.sql and rollback_definitely_safe_migrations.sql to scratch directory.');
