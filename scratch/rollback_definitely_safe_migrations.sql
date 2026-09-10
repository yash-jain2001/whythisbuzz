-- ROLLBACK SCRIPT FOR DEFINITELY SAFE MIGRATIONS
-- Reverts 26 article categories back to original values
-- Generated on: 2026-09-09T13:34:32.825Z

BEGIN;

-- #1: Revert "Scott Adams Dies at 68: How Dilbert Made Him Famous and What Led to Its End" back to 'World'
UPDATE articles SET category = 'World' WHERE id = '29fdadf6-1618-492e-998c-a062b2eac834';

-- #2: Revert "Inside Awarapan 2: What You Need to Know" back to 'Movies'
UPDATE articles SET category = 'Movies' WHERE id = '35e5cdc1-36e4-4c02-b7f1-e79c7c88f96b';

-- #3: Revert "Power Play: Why Virginia''s Governor Is Fighting a Massive Utility Merger" back to 'World Affairs'
UPDATE articles SET category = 'World Affairs' WHERE id = '90621cea-6254-445b-97a3-f69d7c8432e4';

-- #4: Revert "Lipowitz Reigns in Slovenia: A Tour de France Dark Horse Emerges?" back to 'Entertainment'
UPDATE articles SET category = 'Entertainment' WHERE id = '3ab4d3fd-aa59-4d51-88c5-0b658d1a03bf';

-- #5: Revert "Scooter Shenanigans: NASCAR Rivals Ryan Blaney & Chase Elliott Go Viral" back to 'Social-Media'
UPDATE articles SET category = 'Social-Media' WHERE id = '6d6dbd50-e7b6-4a28-883c-8fb88230fbed';

-- #6: Revert "Lindner Unloads on Merz: Germany''s Pension War Heats Up!" back to 'World Affairs'
UPDATE articles SET category = 'World Affairs' WHERE id = '7f1ce5a9-2a4b-4592-b6e6-22126dedab0b';

-- #7: Revert "Snooker Shockwave: Judd Trump''s World No. 1 Reign Rocked by China Open Upset" back to 'World Affairs'
UPDATE articles SET category = 'World Affairs' WHERE id = 'c2da9998-3136-4984-8567-b23377bc16f8';

-- #8: Revert "S&P 500 Sinks: The Perfect Storm That Crushed Markets" back to 'World Affairs'
UPDATE articles SET category = 'World Affairs' WHERE id = '1bdac501-9dc8-48a9-8c4a-4b8bbe89d353';

-- #9: Revert "Why Marvel Rivals Season 10 is Changing Everything" back to 'Technology'
UPDATE articles SET category = 'Technology' WHERE id = '052b7d76-a754-465e-a87e-e1a76ca5e929';

-- #10: Revert "Germany''s Pension Tsunami: Why Your Retirement Income Just Got a Reality Check" back to 'World Affairs'
UPDATE articles SET category = 'World Affairs' WHERE id = '7d20f668-393b-49c0-8ae7-f8747dcdb70e';

-- #11: Revert "Why Marcus Rashford''s Man Utd Future is Hanging in the Balance" back to 'World Affairs'
UPDATE articles SET category = 'World Affairs' WHERE id = 'd16223e0-98a7-42ec-8588-5b15b0456eb9';

-- #12: Revert "How MP Josh Burns Unexpectedly Navigated His Hardest Year Yet" back to 'World Affairs'
UPDATE articles SET category = 'World Affairs' WHERE id = '3a1b075e-7726-4fb8-b722-50011eb2b44a';

-- #13: Revert "Pogacar''s Unstoppable Reign Continues as Young Gun Seixas Shakes Up Tour de France Podium Battle" back to 'Entertainment'
UPDATE articles SET category = 'Entertainment' WHERE id = 'aff77011-4cdc-4970-b0f6-dff298773a2e';

-- #14: Revert "Pogacar''s Pyrenean Power Play: How He Seized Tour De France Control" back to 'Entertainment'
UPDATE articles SET category = 'Entertainment' WHERE id = '8f88d99f-5f4a-4a2b-9395-243b7fb050c2';

-- #15: Revert "Why the 2026 Stock Market Under Trump is Shifting Right Now" back to 'Politics'
UPDATE articles SET category = 'Politics' WHERE id = '4cac710d-433d-4d59-8cb4-0c691a43ab64';

-- #16: Revert "What Binance''s New AI Trading Launch Means for Crypto" back to 'Technology'
UPDATE articles SET category = 'Technology' WHERE id = 'f93f787d-4e63-46a9-8131-147d714bdae8';

-- #17: Revert "Inside the Canada-U.S. Tariff Talks: What You Need to Know" back to 'Politics'
UPDATE articles SET category = 'Politics' WHERE id = '70677166-1df8-4031-a52e-4cc2326332c0';

-- #18: Revert "Why Binance''s New AI Agent Platform Changes Crypto Trading" back to 'Technology'
UPDATE articles SET category = 'Technology' WHERE id = '87c233a6-3d5a-4707-99f5-9417695f6d23';

-- #19: Revert "Why CZ Binance is Making an Unexpected Move in Bhutan Right Now" back to 'Technology'
UPDATE articles SET category = 'Technology' WHERE id = '5d52163d-a37c-4732-a5e5-52e44101ff0c';

-- #20: Revert "The Real Reason Behind the Sudden US-Canada Trade War" back to 'Politics'
UPDATE articles SET category = 'Politics' WHERE id = '1c9cec28-39f2-4939-a929-1a96767dc23d';

-- #21: Revert "Inside Manchester Pride 2026: What You Need to Know" back to 'World Affairs'
UPDATE articles SET category = 'World Affairs' WHERE id = 'f2be2a55-4bad-4f00-a640-de84d53362d4';

-- #22: Revert "Why the Binance App Is Trending Right Now" back to 'Technology'
UPDATE articles SET category = 'Technology' WHERE id = 'a4766a13-7258-4180-845b-dc2aefa2e5df';

-- #23: Revert "The Real Reason Behind France’s New Pension Reform Plan" back to 'Politics'
UPDATE articles SET category = 'Politics' WHERE id = '502571da-866e-4ec5-a777-7ba5a5b85aa8';

-- #24: Revert "The Real Reason Behind Trump''s Bold New Tariff Strategy" back to 'Politics'
UPDATE articles SET category = 'Politics' WHERE id = '0a1f9a88-a4a4-4866-8569-43d3f15a99e2';

-- #25: Revert "Inside the Sacramento State Football Scare: What You Need to Know" back to 'World Affairs'
UPDATE articles SET category = 'World Affairs' WHERE id = 'f0ffbba3-245e-4b5c-ad80-7a01b6cf2133';

-- #26: Revert "Why Russia''s Foreign Minister Accuses Germany of War" back to 'Politics'
UPDATE articles SET category = 'Politics' WHERE id = '299d02bd-100c-4cbe-9ef4-36a2da2930bd';

COMMIT;
