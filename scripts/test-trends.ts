import Parser from 'rss-parser';

const parser = new Parser({
  customFields: {
    item: [
      ['ht:approx_traffic', 'approx_traffic'],
      ['ht:news_item', 'news_item', { keepArray: true }],
    ],
  }
});

async function test() {
  const feed = await parser.parseURL('https://trends.google.com/trending/rss?geo=US');
  const firstItem = feed.items[0];
  console.log("Title:", firstItem.title);
  console.log("Traffic:", firstItem.approx_traffic);
  console.log("News Items:");
  if (firstItem.news_item) {
    firstItem.news_item.forEach((news: any) => {
      console.log("- News:", news['ht:news_item_title'][0], "| Link:", news['ht:news_item_url'][0]);
    });
  }
}

test().catch(console.error);
