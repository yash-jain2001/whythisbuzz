-- ROLLBACK SCRIPT FOR SAFE MIGRATIONS
-- Reverts 48 article categories back to original values
-- Generated on: 2026-09-09T13:28:30.109Z

BEGIN;

-- #1: Revert "Scott Adams Dies at 68: How Dilbert Made Him Famous and What Led to Its End" back to 'World'
UPDATE articles SET category = 'World' WHERE id = '29fdadf6-1618-492e-998c-a062b2eac834';

-- #2: Revert "Inside Awarapan 2: What You Need to Know" back to 'Movies'
UPDATE articles SET category = 'Movies' WHERE id = '35e5cdc1-36e4-4c02-b7f1-e79c7c88f96b';

-- #3: Revert "Power Play: Why Virginia''s Governor Is Fighting a Massive Utility Merger" back to 'World Affairs'
UPDATE articles SET category = 'World Affairs' WHERE id = '90621cea-6254-445b-97a3-f69d7c8432e4';

-- #4: Revert "Middle East Meltdown: Trump''s Claims, Oil Price Chaos, & Recession Fears" back to 'Politics'
UPDATE articles SET category = 'Politics' WHERE id = '78368796-970b-4269-8eed-239161d1184a';

-- #5: Revert "Lipowitz Reigns in Slovenia: A Tour de France Dark Horse Emerges?" back to 'Entertainment'
UPDATE articles SET category = 'Entertainment' WHERE id = '3ab4d3fd-aa59-4d51-88c5-0b658d1a03bf';

-- #6: Revert "Scooter Shenanigans: NASCAR Rivals Ryan Blaney & Chase Elliott Go Viral" back to 'Social-Media'
UPDATE articles SET category = 'Social-Media' WHERE id = '6d6dbd50-e7b6-4a28-883c-8fb88230fbed';

-- #7: Revert "Kylian Mbappé: French Football''s Troubled Genius or Political Game-Changer?" back to 'Sports'
UPDATE articles SET category = 'Sports' WHERE id = '12793c97-b23e-4a12-b790-c73da8c78d65';

-- #8: Revert "Lindner Unloads on Merz: Germany''s Pension War Heats Up!" back to 'World Affairs'
UPDATE articles SET category = 'World Affairs' WHERE id = '7f1ce5a9-2a4b-4592-b6e6-22126dedab0b';

-- #9: Revert "Snooker Shockwave: Judd Trump''s World No. 1 Reign Rocked by China Open Upset" back to 'World Affairs'
UPDATE articles SET category = 'World Affairs' WHERE id = 'c2da9998-3136-4984-8567-b23377bc16f8';

-- #10: Revert "SpaceX Bags $920M/Month Google Deal: An AI Lifeline Before IPO?" back to 'Technology'
UPDATE articles SET category = 'Technology' WHERE id = '018872e5-c0e8-4e69-af18-00ad9dafdc5b';

-- #11: Revert "Why Cambridge''s Vice-Chancellor Just Admitted to Deep Concerns Over High-Profile Resignation" back to 'World Affairs'
UPDATE articles SET category = 'World Affairs' WHERE id = '8a8eaaca-db2e-4af8-a81a-0b6968fa05f7';

-- #12: Revert "S&P 500 Sinks: The Perfect Storm That Crushed Markets" back to 'World Affairs'
UPDATE articles SET category = 'World Affairs' WHERE id = '1bdac501-9dc8-48a9-8c4a-4b8bbe89d353';

-- #13: Revert "Why Marvel Rivals Season 10 is Changing Everything" back to 'Technology'
UPDATE articles SET category = 'Technology' WHERE id = '052b7d76-a754-465e-a87e-e1a76ca5e929';

-- #14: Revert "Trump''s Iran Pause: How Geopolitics Ignited Bitcoin''s Wild Ride" back to 'World Affairs'
UPDATE articles SET category = 'World Affairs' WHERE id = '9ca89fc8-adf5-4af2-8247-56f6a35f7944';

-- #15: Revert "Germany''s Pension Tsunami: Why Your Retirement Income Just Got a Reality Check" back to 'World Affairs'
UPDATE articles SET category = 'World Affairs' WHERE id = '7d20f668-393b-49c0-8ae7-f8747dcdb70e';

-- #16: Revert "UCL Final''s Power Play: Why Brandon Flowers & David Beckham Are Racing to Budapest" back to 'Entertainment'
UPDATE articles SET category = 'Entertainment' WHERE id = '5ab986b6-910a-42f1-97b5-f34465d153a5';

-- #17: Revert "Why AI Video Generators Are Taking Over TikTok Right Now" back to 'Technology'
UPDATE articles SET category = 'Technology' WHERE id = '381873a2-3058-4140-8c8f-425075acd6ff';

-- #18: Revert "Why Marcus Rashford''s Man Utd Future is Hanging in the Balance" back to 'World Affairs'
UPDATE articles SET category = 'World Affairs' WHERE id = 'd16223e0-98a7-42ec-8588-5b15b0456eb9';

-- #19: Revert "How MP Josh Burns Unexpectedly Navigated His Hardest Year Yet" back to 'World Affairs'
UPDATE articles SET category = 'World Affairs' WHERE id = '3a1b075e-7726-4fb8-b722-50011eb2b44a';

-- #20: Revert "Pogacar''s Unstoppable Reign Continues as Young Gun Seixas Shakes Up Tour de France Podium Battle" back to 'Entertainment'
UPDATE articles SET category = 'Entertainment' WHERE id = 'aff77011-4cdc-4970-b0f6-dff298773a2e';

-- #21: Revert "Pogacar''s Pyrenean Power Play: How He Seized Tour De France Control" back to 'Entertainment'
UPDATE articles SET category = 'Entertainment' WHERE id = '8f88d99f-5f4a-4a2b-9395-243b7fb050c2';

-- #22: Revert "Why the 2026 Stock Market Under Trump is Shifting Right Now" back to 'Politics'
UPDATE articles SET category = 'Politics' WHERE id = '4cac710d-433d-4d59-8cb4-0c691a43ab64';

-- #23: Revert "Why AI Video Generators Are Suddenly Taking Over TikTok" back to 'Technology'
UPDATE articles SET category = 'Technology' WHERE id = '496aa117-ea67-4950-a58b-9d816d1fc1c1';

-- #24: Revert "Why AI Inspo’s New Video Tool is Shaking Up TikTok and Reels Right Now" back to 'Technology'
UPDATE articles SET category = 'Technology' WHERE id = '4bd71211-4b02-47c2-b97c-c6fa9fa61f61';

-- #25: Revert "What Binance''s New AI Trading Launch Means for Crypto" back to 'Technology'
UPDATE articles SET category = 'Technology' WHERE id = 'f93f787d-4e63-46a9-8131-147d714bdae8';

-- #26: Revert "Inside the Canada-U.S. Tariff Talks: What You Need to Know" back to 'Politics'
UPDATE articles SET category = 'Politics' WHERE id = '70677166-1df8-4031-a52e-4cc2326332c0';

-- #27: Revert "Why Binance''s New AI Agent Platform Changes Crypto Trading" back to 'Technology'
UPDATE articles SET category = 'Technology' WHERE id = '87c233a6-3d5a-4707-99f5-9417695f6d23';

-- #28: Revert "Why AI Inspo''s New Video Generator Is Winning TikTok" back to 'Technology'
UPDATE articles SET category = 'Technology' WHERE id = 'cfccc90f-dcfa-4d1c-b8e2-fea3fe7f8c26';

-- #29: Revert "Why CZ Binance is Making an Unexpected Move in Bhutan Right Now" back to 'Technology'
UPDATE articles SET category = 'Technology' WHERE id = '5d52163d-a37c-4732-a5e5-52e44101ff0c';

-- #30: Revert "The Real Reason Behind the Sudden US-Canada Trade War" back to 'Politics'
UPDATE articles SET category = 'Politics' WHERE id = '1c9cec28-39f2-4939-a929-1a96767dc23d';

-- #31: Revert "Why Rosenheim''s DIY Fireworks Blast Left Teens Critical" back to 'World Affairs'
UPDATE articles SET category = 'World Affairs' WHERE id = '79ffe6d4-a42b-458c-8bfb-135346e07179';

-- #32: Revert "The Real Reason Behind France’s Sweeping School Smartphone Ban" back to 'Politics'
UPDATE articles SET category = 'Politics' WHERE id = 'f5db2ef3-5de0-4634-9f72-48f5eacebaaa';

-- #33: Revert "The Real Reason Behind Nvidia’s Unreal $96 Billion Revenue Surge" back to 'Economics'
UPDATE articles SET category = 'Economics' WHERE id = 'f8a8ff0a-8104-4e5b-8467-26766eb3d75f';

-- #34: Revert "Inside Manchester Pride 2026: What You Need to Know" back to 'World Affairs'
UPDATE articles SET category = 'World Affairs' WHERE id = 'f2be2a55-4bad-4f00-a640-de84d53362d4';

-- #35: Revert "Why Social Media Influencer Manjeet Kaur''s Tragic Murder Shocked Us" back to 'World Affairs'
UPDATE articles SET category = 'World Affairs' WHERE id = '19b10a3b-f9b0-4a99-8c85-0bd551e93a9b';

-- #36: Revert "Why 6th-Generation Fighters Are Transforming Air Warfare" back to 'Technology'
UPDATE articles SET category = 'Technology' WHERE id = '4c49545e-2f85-4de2-8472-3b9221fff340';

-- #37: Revert "Why the Binance App Is Trending Right Now" back to 'Technology'
UPDATE articles SET category = 'Technology' WHERE id = 'a4766a13-7258-4180-845b-dc2aefa2e5df';

-- #38: Revert "The Real Reason Behind France’s New Pension Reform Plan" back to 'Politics'
UPDATE articles SET category = 'Politics' WHERE id = '502571da-866e-4ec5-a777-7ba5a5b85aa8';

-- #39: Revert "The Real Reason Behind Grian Chatten''s Viral Welsh Football Shirt" back to 'Entertainment'
UPDATE articles SET category = 'Entertainment' WHERE id = 'e0ba4bbc-fa6e-490a-b10a-86b8ff9bf29d';

-- #40: Revert "The Real Reason Behind Trump''s Bold New Tariff Strategy" back to 'Politics'
UPDATE articles SET category = 'Politics' WHERE id = '0a1f9a88-a4a4-4866-8569-43d3f15a99e2';

-- #41: Revert "Why AI Inspo''s New Video Generator Is Winning Over TikTok" back to 'Technology'
UPDATE articles SET category = 'Technology' WHERE id = '2e74ca89-1a04-497c-9b2f-0a736aafcd24';

-- #42: Revert "Why Starbucks'' Snoopy Merchandise is Going Viral Right Now" back to 'Entertainment'
UPDATE articles SET category = 'Entertainment' WHERE id = '7d4cc979-234a-45fa-94cf-c5a52d55ae95';

-- #43: Revert "Why Donald Trump Is Threatening to Cut Off US Trade" back to 'Economics'
UPDATE articles SET category = 'Economics' WHERE id = 'f7bbd0b0-2fb8-479b-8213-1668265a7e16';

-- #44: Revert "Why AI Inspo''s New Video Generator Is Changing TikTok" back to 'Technology'
UPDATE articles SET category = 'Technology' WHERE id = '72df3686-1911-444f-a776-e3c1655bdc5c';

-- #45: Revert "Why AI Inspo''s New Video Generator Is Going Viral" back to 'Technology'
UPDATE articles SET category = 'Technology' WHERE id = '6b02481b-a7e9-42ae-aa76-fc59dd8729d1';

-- #46: Revert "Inside the Sacramento State Football Scare: What You Need to Know" back to 'World Affairs'
UPDATE articles SET category = 'World Affairs' WHERE id = 'f0ffbba3-245e-4b5c-ad80-7a01b6cf2133';

-- #47: Revert "Why Russia''s Foreign Minister Accuses Germany of War" back to 'Politics'
UPDATE articles SET category = 'Politics' WHERE id = '299d02bd-100c-4cbe-9ef4-36a2da2930bd';

-- #48: Revert "Why AI Inspo’s New Video Tool is Changing TikTok" back to 'Technology'
UPDATE articles SET category = 'Technology' WHERE id = 'ca41e707-35b6-432f-861f-32edc2814cda';

COMMIT;
