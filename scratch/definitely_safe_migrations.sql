-- DEFINITELY SAFE MIGRATIONS SCRIPT (REVIEW ONLY - DO NOT EXECUTE AUTOMATICALLY)
-- Contains ONLY 26 verified safe migrations (2 Legacy + 24 Definitely Safe)
-- Generated on: 2026-09-09T13:34:32.823Z

BEGIN;

-- #1: Scott Adams Dies at 68: How Dilbert Made Him Famous and What Led to Its End
-- Primary Subject: World Affairs
-- Reason: Legacy database category 'World' mapped to canonical 'World Affairs'
UPDATE articles SET category = 'World Affairs' WHERE id = '29fdadf6-1618-492e-998c-a062b2eac834';

-- #2: Inside Awarapan 2: What You Need to Know
-- Primary Subject: Entertainment
-- Reason: Legacy database category 'Movies' mapped to canonical 'Entertainment'
UPDATE articles SET category = 'Entertainment' WHERE id = '35e5cdc1-36e4-4c02-b7f1-e79c7c88f96b';

-- #3: Power Play: Why Virginia''s Governor Is Fighting a Massive Utility Merger
-- Primary Subject: Politics (Governor Political Action)
-- Reason: Virginia Governor Spanberger political intervention in regulatory affairs.
UPDATE articles SET category = 'Politics' WHERE id = '90621cea-6254-445b-97a3-f69d7c8432e4';

-- #4: Lipowitz Reigns in Slovenia: A Tour de France Dark Horse Emerges?
-- Primary Subject: Sports (Tour de France cycling race)
-- Reason: Tour de France is an iconic professional cycling sports competition.
UPDATE articles SET category = 'Sports' WHERE id = '3ab4d3fd-aa59-4d51-88c5-0b658d1a03bf';

-- #5: Scooter Shenanigans: NASCAR Rivals Ryan Blaney & Chase Elliott Go Viral
-- Primary Subject: Sports (NASCAR drivers)
-- Reason: Features top NASCAR professional drivers Ryan Blaney & Chase Elliott.
UPDATE articles SET category = 'Sports' WHERE id = '6d6dbd50-e7b6-4a28-883c-8fb88230fbed';

-- #6: Lindner Unloads on Merz: Germany''s Pension War Heats Up!
-- Primary Subject: Economics (Pension Reform)
-- Reason: Covers national retirement income financial systems and pension math.
UPDATE articles SET category = 'Economics' WHERE id = '7f1ce5a9-2a4b-4592-b6e6-22126dedab0b';

-- #7: Snooker Shockwave: Judd Trump''s World No. 1 Reign Rocked by China Open Upset
-- Primary Subject: Sports (Snooker tournament)
-- Reason: Covers World No. 1 snooker player Judd Trump in China Open.
UPDATE articles SET category = 'Sports' WHERE id = 'c2da9998-3136-4984-8567-b23377bc16f8';

-- #8: S&P 500 Sinks: The Perfect Storm That Crushed Markets
-- Primary Subject: Economics (Stock Market)
-- Reason: Covers S&P 500 stock market decline and Wall Street trading.
UPDATE articles SET category = 'Economics' WHERE id = '1bdac501-9dc8-48a9-8c4a-4b8bbe89d353';

-- #9: Why Marvel Rivals Season 10 is Changing Everything
-- Primary Subject: Entertainment (Marvel Video Game Content)
-- Reason: Marvel media superhero video game season update.
UPDATE articles SET category = 'Entertainment' WHERE id = '052b7d76-a754-465e-a87e-e1a76ca5e929';

-- #10: Germany''s Pension Tsunami: Why Your Retirement Income Just Got a Reality Check
-- Primary Subject: Economics (Pension Reform)
-- Reason: Covers national retirement income financial systems and pension math.
UPDATE articles SET category = 'Economics' WHERE id = '7d20f668-393b-49c0-8ae7-f8747dcdb70e';

-- #11: Why Marcus Rashford''s Man Utd Future is Hanging in the Balance
-- Primary Subject: Sports (Football / Man Utd)
-- Reason: Manchester United footballer transfer window future.
UPDATE articles SET category = 'Sports' WHERE id = 'd16223e0-98a7-42ec-8588-5b15b0456eb9';

-- #12: How MP Josh Burns Unexpectedly Navigated His Hardest Year Yet
-- Primary Subject: Politics (Parliamentary MP)
-- Reason: Profile of Federal Labor MP Josh Burns navigating parliamentary life.
UPDATE articles SET category = 'Politics' WHERE id = '3a1b075e-7726-4fb8-b722-50011eb2b44a';

-- #13: Pogacar''s Unstoppable Reign Continues as Young Gun Seixas Shakes Up Tour de France Podium Battle
-- Primary Subject: Sports (Tour de France cycling race)
-- Reason: Tour de France is an iconic professional cycling sports competition.
UPDATE articles SET category = 'Sports' WHERE id = 'aff77011-4cdc-4970-b0f6-dff298773a2e';

-- #14: Pogacar''s Pyrenean Power Play: How He Seized Tour De France Control
-- Primary Subject: Sports (Tour de France cycling race)
-- Reason: Tour de France is an iconic professional cycling sports competition.
UPDATE articles SET category = 'Sports' WHERE id = '8f88d99f-5f4a-4a2b-9395-243b7fb050c2';

-- #15: Why the 2026 Stock Market Under Trump is Shifting Right Now
-- Primary Subject: Economics (Stock Market)
-- Reason: Covers Wall Street equity market shifts and investor portfolio strategies.
UPDATE articles SET category = 'Economics' WHERE id = '4cac710d-433d-4d59-8cb4-0c691a43ab64';

-- #16: What Binance''s New AI Trading Launch Means for Crypto
-- Primary Subject: Economics (Cryptocurrency Exchange / Finance)
-- Reason: Covers Binance crypto trading, automated financial trading, and Web3 assets.
UPDATE articles SET category = 'Economics' WHERE id = 'f93f787d-4e63-46a9-8131-147d714bdae8';

-- #17: Inside the Canada-U.S. Tariff Talks: What You Need to Know
-- Primary Subject: Economics (Tariffs & International Trade)
-- Reason: Covers import trade quotas, commercial tariffs, and international trade policy.
UPDATE articles SET category = 'Economics' WHERE id = '70677166-1df8-4031-a52e-4cc2326332c0';

-- #18: Why Binance''s New AI Agent Platform Changes Crypto Trading
-- Primary Subject: Economics (Cryptocurrency Exchange / Finance)
-- Reason: Covers Binance crypto trading, automated financial trading, and Web3 assets.
UPDATE articles SET category = 'Economics' WHERE id = '87c233a6-3d5a-4707-99f5-9417695f6d23';

-- #19: Why CZ Binance is Making an Unexpected Move in Bhutan Right Now
-- Primary Subject: Economics (Cryptocurrency Exchange / Finance)
-- Reason: Covers Binance crypto trading, automated financial trading, and Web3 assets.
UPDATE articles SET category = 'Economics' WHERE id = '5d52163d-a37c-4732-a5e5-52e44101ff0c';

-- #20: The Real Reason Behind the Sudden US-Canada Trade War
-- Primary Subject: Economics (Tariffs & International Trade)
-- Reason: Covers import trade quotas, commercial tariffs, and international trade policy.
UPDATE articles SET category = 'Economics' WHERE id = '1c9cec28-39f2-4939-a929-1a96767dc23d';

-- #21: Inside Manchester Pride 2026: What You Need to Know
-- Primary Subject: Entertainment (Festival & Cultural Event)
-- Reason: Manchester Pride music and LGBTQ+ festival celebration.
UPDATE articles SET category = 'Entertainment' WHERE id = 'f2be2a55-4bad-4f00-a640-de84d53362d4';

-- #22: Why the Binance App Is Trending Right Now
-- Primary Subject: Economics (Cryptocurrency Exchange / Finance)
-- Reason: Covers Binance crypto trading, automated financial trading, and Web3 assets.
UPDATE articles SET category = 'Economics' WHERE id = 'a4766a13-7258-4180-845b-dc2aefa2e5df';

-- #23: The Real Reason Behind France’s New Pension Reform Plan
-- Primary Subject: Economics (Pension Reform)
-- Reason: Covers national retirement income financial systems and pension math.
UPDATE articles SET category = 'Economics' WHERE id = '502571da-866e-4ec5-a777-7ba5a5b85aa8';

-- #24: The Real Reason Behind Trump''s Bold New Tariff Strategy
-- Primary Subject: Economics (Tariffs & International Trade)
-- Reason: Covers import trade quotas, commercial tariffs, and international trade policy.
UPDATE articles SET category = 'Economics' WHERE id = '0a1f9a88-a4a4-4866-8569-43d3f15a99e2';

-- #25: Inside the Sacramento State Football Scare: What You Need to Know
-- Primary Subject: Sports (College Football)
-- Reason: Covers Sacramento State college football team.
UPDATE articles SET category = 'Sports' WHERE id = 'f0ffbba3-245e-4b5c-ad80-7a01b6cf2133';

-- #26: Why Russia''s Foreign Minister Accuses Germany of War
-- Primary Subject: World Affairs (Geopolitical War Threat)
-- Reason: International diplomacy and war threats between Russia and Germany.
UPDATE articles SET category = 'World Affairs' WHERE id = '299d02bd-100c-4cbe-9ef4-36a2da2930bd';

COMMIT;
